package routes

import (
	"fmt"
	"net/http"
	"os"

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

	// Determine IP lookup strategy based on environment
	ipLookupName := os.Getenv("IP_LOOKUP")
	if ipLookupName == "" {
		ipLookupName = "RemoteAddr"
	}
	fmt.Printf("Using %s as IPLookupName.\n", ipLookupName)

	// --- Create Limiters ---

	// Auth limiter: 10 requests per minute (RPM)
	authLimiter := tollbooth.NewLimiter(10, nil)
	authLimiter.SetIPLookup(limiter.IPLookup{
		Name:           ipLookupName,
		IndexFromRight: 0,
	})
	authLimiter.SetMethods([]string{"POST"})

	// API limiter: 5 requests per second (RPS)
	apiLimiter := tollbooth.NewLimiter(5, nil)
	apiLimiter.SetIPLookup(limiter.IPLookup{
		Name:           ipLookupName,
		IndexFromRight: 0,
	})
	apiLimiter.SetMethods([]string{"GET", "POST", "PUT", "PATCH", "DELETE"})

	// --- Public Routes ---

	// Health: no rate limit
	r.HandleFunc("/api/health", handlers.HealthHandler(db)).Methods("GET", "HEAD")

	// Auth routes (register & login) with authLimiter middleware
	authRouter := r.PathPrefix("/api/auth").Subrouter()
	authRouter.Use(func(next http.Handler) http.Handler {
		return tollbooth.LimitHandler(authLimiter, next)
	})
	authRouter.HandleFunc("/register", handlers.RegisterHandler(db)).Methods("POST")
	authRouter.HandleFunc("/login", handlers.LoginHandler(db, jwtSecret, jwtTime)).Methods("POST")

	// --- Protected Routes (Auth Required + 5 RPS) ---
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.Use(func(next http.Handler) http.Handler {
		return tollbooth.LimitHandler(apiLimiter, next)
	})

	// Categories
	protected.HandleFunc("/categories", handlers.CategoriesHandler(db)).Methods("GET", "POST")
	protected.HandleFunc("/categories/{id}", handlers.CategoryByIDHandler(db)).Methods("GET", "DELETE")

	// Products
	protected.HandleFunc("/products", handlers.ProductsHandler(db)).Methods("GET", "POST")
	protected.HandleFunc("/products/{id}", handlers.ProductByIDHandler(db)).Methods("GET", "DELETE", "PATCH")

	// Bulk operations
	protected.HandleFunc("/products/bulk/create", handlers.BulkCreateHandler(db)).Methods("POST")
	protected.HandleFunc("/products/bulk/update", handlers.BulkUpdateHandler(db)).Methods("PATCH")
	protected.HandleFunc("/products/bulk/delete", handlers.BulkDeleteHandler(db)).Methods("DELETE")

	return r
}
