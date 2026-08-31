package routes

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/didip/tollbooth/v8"
	"github.com/didip/tollbooth/v8/limiter"
	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"ims/handlers"
	"ims/middleware"
)

func SetupRoutes(db *gorm.DB, jwtSecret []byte, jwtTime uint) *mux.Router {
	middleware.InitJWT(jwtSecret)

	r := mux.NewRouter()
	r.Use(middleware.MaxBytesMiddleware(5 << 20))

	ipLookupName := os.Getenv("IP_LOOKUP")
	if ipLookupName == "" {
		ipLookupName = "RemoteAddr"
	}
	log.Printf("Using %s as IPLookupName", ipLookupName)

	// --- Create Limiters ---
	authLimiter := tollbooth.NewLimiter(10, nil)
	authLimiter.SetIPLookup(limiter.IPLookup{
		Name:           ipLookupName,
		IndexFromRight: 0,
	})
	authLimiter.SetMethods([]string{"POST"})

	apiLimiter := tollbooth.NewLimiter(5, nil)
	apiLimiter.SetIPLookup(limiter.IPLookup{
		Name:           ipLookupName,
		IndexFromRight: 0,
	})
	apiLimiter.SetMethods([]string{"GET", "POST", "PUT", "PATCH", "DELETE"})

	// --- Global middleware: apply rate limiting based on route ---
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			path := req.URL.Path

			// Public auth routes: 10 RPM
			if strings.HasPrefix(path, "/api/auth/") {
				tollbooth.LimitHandler(authLimiter, next).ServeHTTP(w, req)
				return
			}

			// Protected API routes: 5 RPS (but skip health)
			if strings.HasPrefix(path, "/api/") && path != "/api/health" {
				tollbooth.LimitHandler(apiLimiter, next).ServeHTTP(w, req)
				return
			}

			// Health: no limit
			next.ServeHTTP(w, req)
		})
	})

	// --- Routes ---

	// Health (no limit)
	r.HandleFunc("/api/health", handlers.HealthHandler(db)).Methods("GET", "HEAD")

	// Auth routes
	r.HandleFunc("/api/auth/register", handlers.RegisterHandler(db)).Methods("POST")
	r.HandleFunc("/api/auth/login", handlers.LoginHandler(db, jwtSecret, jwtTime)).Methods("POST")

	// Protected routes (auth middleware)
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/categories", handlers.CategoriesHandler(db)).Methods("GET", "POST")
	protected.HandleFunc("/categories/{id}", handlers.CategoryByIDHandler(db)).Methods("GET", "DELETE")
	protected.HandleFunc("/products", handlers.ProductsHandler(db)).Methods("GET", "POST")
	protected.HandleFunc("/products/{id}", handlers.ProductByIDHandler(db)).Methods("GET", "DELETE", "PATCH")
	protected.HandleFunc("/products/bulk/create", handlers.BulkCreateHandler(db)).Methods("POST")
	protected.HandleFunc("/products/bulk/update", handlers.BulkUpdateHandler(db)).Methods("PATCH")
	protected.HandleFunc("/products/bulk/delete", handlers.BulkDeleteHandler(db)).Methods("DELETE")

	return r
}
