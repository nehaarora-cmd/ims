package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"gorm.io/gorm"
)

// ComponentStatus tracks the individual health state of our database connection
type ComponentStatus struct {
	Status string `json:"status"`
	Error  string `json:"error,omitempty"`
}

// HealthResponse forms the structured JSON output required for clear system monitoring
type HealthResponse struct {
	Status    string                     `json:"status"`
	Timestamp string                     `json:"timestamp"`
	Version   string                     `json:"version"`
	Details   map[string]ComponentStatus `json:"details"`
}

// HealthHandler acts as a network bridge verifying connectivity from Render to your database
func HealthHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Enforce a strict 3-second network timeout window for the database handshake
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		details := make(map[string]ComponentStatus)
		overallHealthy := true

		// Extract the underlying driver layer from GORM
		sqlDB, err := db.DB()
		if err != nil {
			overallHealthy = false
			details["database"] = ComponentStatus{
				Status: "DOWN",
				Error:  "Failed to extract database connection layer: " + err.Error(),
			}
		} else {
			// Perform a network ping against your database server using our timeout context
			err = sqlDB.PingContext(ctx)
			if err != nil {
				overallHealthy = false
				details["database"] = ComponentStatus{
					Status: "DOWN",
					Error:  "Database connection failed: " + err.Error(),
				}
			} else {
				details["database"] = ComponentStatus{
					Status: "UP",
				}
			}
		}

		// Map the consolidated results into our payload struct layout
		response := HealthResponse{
			Status:    "UP",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Version:   "1.0.0",
			Details:   details,
		}

		// Intercept failures to adjust status properties and force correct header sequence
		if !overallHealthy {
			response.Status = "DOWN"
			w.WriteHeader(http.StatusServiceUnavailable) // Locks in 503 for UptimeRobot monitoring
		} else {
			w.WriteHeader(http.StatusOK) // Locks in 200 OK for standard operations
		}

		// Stream the structured response out to the client network channel
		json.NewEncoder(w).Encode(response)
	}
}
