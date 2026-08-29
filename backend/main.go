package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"ims/database"
	"ims/models"
	"ims/routes"

	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/middleware/stdlib"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

func main() {
	// Load .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	} else {
		log.Println(".env file loaded successfully")
	}
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		log.Fatal("JWT_SECRET is required in .env file")
	}

	jwtTimeStr := os.Getenv("JWT_TIME")
	jwtTime64, err := strconv.ParseUint(jwtTimeStr, 10, 0)
	if err != nil {
		log.Fatalf("Invalid JWT_TIME: %v", err)
	}
	jwtTime := uint(jwtTime64)

	// Connect to database
	database.Connect()
	db := database.DB

	// Auto migrate
	db.AutoMigrate(&models.User{}, &models.Category{}, &models.Product{})
	log.Println("Database migration completed")

	// Setup routes
	r := routes.SetupRoutes(db, jwtSecret, jwtTime)

	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  100,
	}

	// Use in-memory store (replace with Redis for distributed systems)
	store := memory.NewStore()

	instance := limiter.New(store, rate,
		limiter.WithClientIPHeader("X-Forwarded-For"))

	// Create stdlib middleware
	limiterMiddleware := stdlib.NewMiddleware(instance)

	// Apply rate limiter to your routes
	rateLimitedHandler := limiterMiddleware.Handler(r)

	// --- CORS MIDDLEWARE ---
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "https://ims-git-master-neha-arora.vercel.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	// Wrap with CORS (CORS first, then rate limiting, or vice versa)
	// CORS usually needs to be outermost to handle preflight requests.
	handler := c.Handler(rateLimitedHandler)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
