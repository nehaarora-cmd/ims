package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"ims/models"
)

func CategoriesHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userID, ok := r.Context().Value("user_id").(uint)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
			return
		}

		if r.Method == "GET" {
			var categories []models.Category
			db.Where("user_id = ?", userID).Find(&categories)
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(categories)
			return
		}

		if r.Method == "POST" {
			var category models.Category
			err := json.NewDecoder(r.Body).Decode(&category)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
				return
			}
			category.UserID = userID
			db.Create(&category)
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(category)
			return
		}

		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
	}
}

func CategoryByIDHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userID, ok := r.Context().Value("user_id").(uint)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
			return
		}

		vars := mux.Vars(r)
		id := vars["id"]

		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Category ID is required"})
			return
		}

		if r.Method == "GET" {
			var category models.Category
			result := db.Where("id = ? AND user_id = ?", id, userID).First(&category)
			if result.Error != nil {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": "Category not found"})
				return
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(category)
			return
		}

		if r.Method == "DELETE" {
			result := db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Category{})
			if result.RowsAffected == 0 {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": "Category not found"})
				return
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"message": "Category deleted successfully"})
			return
		}

		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
	}
}
