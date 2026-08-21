package routes

import (
	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"ims/handlers"
	"ims/middleware"
)

func SetupRoutes(db *gorm.DB, jwtSecret []byte, jwtTime uint) *mux.Router {
	middleware.InitJWT(jwtSecret)

	r := mux.NewRouter()

	r.Use(middleware.MaxBytesMiddleware(128 << 20))

	// Public routes
	r.HandleFunc("/api/health", handlers.HealthHandler).Methods("GET")
	r.HandleFunc("/api/auth/register", handlers.RegisterHandler(db)).Methods("POST")
	r.HandleFunc("/api/auth/login", handlers.LoginHandler(db, jwtSecret, jwtTime)).Methods("POST")

	// Protected routes
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)

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
