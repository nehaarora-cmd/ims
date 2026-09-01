package routes

import (
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/sethvargo/go-limiter/httplimit"
	"github.com/sethvargo/go-limiter/memorystore"
	"gorm.io/gorm"

	"ims/handlers"
	"ims/middleware"
)

// SetupRoutes configures all HTTP routes with per‑route rate limiting.
func SetupRoutes(db *gorm.DB, jwtSecret []byte, jwtTime uint) *mux.Router {
	middleware.InitJWT(jwtSecret)

	r := mux.NewRouter()
	r.Use(middleware.MaxBytesMiddleware(5 << 20))

	ipSource := os.Getenv("IP_LOOKUP")
	if ipSource == "" {
		ipSource = "X-Forwarded-For"
	}

	keyFunc := func(req *http.Request) (string, error) {
		var ip string

		allowed := map[string]bool{
			"X-Forwarded-For": true,
			"X-Real-IP":       true,
			"RemoteAddr":      true,
		}
		if !allowed[ipSource] {
			panic("invalid IP_LOOKUP: must be one of X-Forwarded-For, X-Real-IP, RemoteAddr")
		}

		switch ipSource {
		case "X-Forwarded-For":
			xff := req.Header.Get("X-Forwarded-For")
			if xff != "" {
				ips := strings.Split(xff, ",")
				if len(ips) > 0 {
					ip = strings.TrimSpace(ips[0])
				}
			}
		case "X-Real-IP":
			ip = req.Header.Get("X-Real-IP")
		case "RemoteAddr":
			host, _, err := net.SplitHostPort(req.RemoteAddr)
			if err == nil {
				ip = host
			} else {
				ip = req.RemoteAddr
			}
		case "CF-Connecting-IP":
			ip = req.Header.Get("CF-Connecting-IP")
		}

		if ip == "" {
			host, _, err := net.SplitHostPort(req.RemoteAddr)
			if err == nil {
				ip = host
			} else {
				ip = req.RemoteAddr
			}
		}

		return ip, nil
	}

	authStore, err := memorystore.New(&memorystore.Config{
		Tokens:   10,
		Interval: time.Minute,
	})
	if err != nil {
		panic(err)
	}
	authLimiter, err := httplimit.NewMiddleware(authStore, keyFunc)
	if err != nil {
		panic(err)
	}

	apiStore, err := memorystore.New(&memorystore.Config{
		Tokens:   5,
		Interval: time.Second,
	})
	if err != nil {
		panic(err)
	}
	apiLimiter, err := httplimit.NewMiddleware(apiStore, keyFunc)
	if err != nil {
		panic(err)
	}

	r.HandleFunc("/api/health", handlers.HealthHandler(db)).Methods("GET", "HEAD")

	authRouter := r.PathPrefix("/api/auth").Subrouter()
	authRouter.Handle("/register", authLimiter.Handle(handlers.RegisterHandler(db))).Methods("POST")
	authRouter.Handle("/login", authLimiter.Handle(handlers.LoginHandler(db, jwtSecret, jwtTime))).Methods("POST")

	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.Handle("/categories", apiLimiter.Handle(handlers.CategoriesHandler(db))).Methods("GET", "POST")
	protected.Handle("/categories/{id}", apiLimiter.Handle(handlers.CategoryByIDHandler(db))).Methods("GET", "DELETE")
	protected.Handle("/products", apiLimiter.Handle(handlers.ProductsHandler(db))).Methods("GET", "POST")
	protected.Handle("/products/{id}", apiLimiter.Handle(handlers.ProductByIDHandler(db))).Methods("GET", "DELETE", "PATCH")
	protected.Handle("/products/bulk/create", apiLimiter.Handle(handlers.BulkCreateHandler(db))).Methods("POST")
	protected.Handle("/products/bulk/update", apiLimiter.Handle(handlers.BulkUpdateHandler(db))).Methods("PATCH")
	protected.Handle("/products/bulk/delete", apiLimiter.Handle(handlers.BulkDeleteHandler(db))).Methods("DELETE")

	return r
}
