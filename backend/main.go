package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors" // Add this import

	"ims/database"
	"ims/models"
	"ims/routes"
)

func main() {
	// Load .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	} else {
		log.Println(".env file loaded successfully")
	}

	// Get JWT secret
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		log.Fatal("JWT_SECRET is required in .env file")
	}

	// Connect to database
	database.Connect()
	db := database.DB

	// Auto migrate
	db.AutoMigrate(&models.User{}, &models.Category{}, &models.Product{})
	log.Println("Database migration completed")

	// Setup routes
	r := routes.SetupRoutes(db, jwtSecret)

	// Add CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
