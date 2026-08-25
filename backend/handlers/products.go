package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"ims/models"
)

func ProductsHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userID, ok := r.Context().Value("user_id").(uint)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found in context"})
			return
		}

		if r.Method == "GET" {
			var products []models.Product
			db.Where("user_id = ?", userID).Find(&products)
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(products)
			return
		}

		if r.Method == "POST" {
			var product models.Product
			err := json.NewDecoder(r.Body).Decode(&product)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
				return
			}

			// --- START: QUANTITY & PRICE CHECKS ---
			if product.Quantity < 0 {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Quantity cannot be negative"})
				return
			}
			if product.Price < 0 {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Price cannot be negative"})
				return
			}
			// --- END: QUANTITY & PRICE CHECKS ---

			product.UserID = userID
			db.Create(&product)
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(product)
			return
		}

		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
	}
}

func ProductByIDHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userID, ok := r.Context().Value("user_id").(uint)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found in context"})
			return
		}

		vars := mux.Vars(r)
		id := vars["id"]

		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Product ID is required"})
			return
		}

		if r.Method == "GET" {
			var product models.Product
			result := db.Where("id = ? AND user_id = ?", id, userID).First(&product)

			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": "Product not found"})
				return
			}
			if result.Error != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
				return
			}

			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(product)
			return
		}

		if r.Method == "DELETE" {
			result := db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Product{})
			if result.RowsAffected == 0 {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": "Product not found"})
				return
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"message": "Product deleted successfully"})
			return
		}

		if r.Method == "PATCH" {
			var inputData models.Product
			err := json.NewDecoder(r.Body).Decode(&inputData)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
				return
			}

			// --- START: QUANTITY & PRICE CHECKS ---
			if inputData.Quantity < 0 {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Quantity cannot be negative"})
				return
			}
			if inputData.Price < 0 {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Price cannot be negative"})
				return
			}
			// --- END: QUANTITY & PRICE CHECKS ---

			result := db.Model(&models.Product{}).Where("id = ? AND user_id = ?", id, userID).Updates(&inputData)
			if result.Error != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": result.Error.Error()})
				return
			}

			if result.RowsAffected == 0 {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": "Product not found"})
				return
			}

			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"message": "Product updated successfully"})
			return
		}

		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
	}
}

func BulkCreateHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userID, ok := r.Context().Value("user_id").(uint)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
			return
		}

		var req models.BulkCreateRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}

		if len(req.Products) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "No products to create"})
			return
		}

		var products []models.Product
		for _, input := range req.Products {
			// --- START: QUANTITY & PRICE CHECKS ---
			if input.Quantity < 0 {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Quantity cannot be negative"})
				return
			}
			if input.Price < 0 {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Price cannot be negative"})
				return
			}
			// --- END: QUANTITY & PRICE CHECKS ---

			products = append(products, models.Product{
				UserID:      userID,
				CategoryID:  input.CategoryID,
				Name:        input.Name,
				Description: input.Description,
				Quantity:    input.Quantity,
				Price:       input.Price,
			})
		}

		db.Create(&products)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(products)
	}
}

func BulkUpdateHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userID, ok := r.Context().Value("user_id").(uint)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
			return
		}

		var req models.BulkUpdateRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}

		if len(req.Products) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "No products to update"})
			return
		}

		var updated []models.Product
		for _, item := range req.Products {
			var product models.Product
			result := db.Where("id = ? AND user_id = ?", item.ID, userID).First(&product)
			if result.Error != nil {
				continue
			}

			// --- START: QUANTITY & PRICE CHECKS (Only if pointers are not nil) ---
			if item.Quantity != nil && *item.Quantity < 0 {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Quantity cannot be negative"})
				return
			}
			if item.Price != nil && *item.Price < 0 {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Price cannot be negative"})
				return
			}
			// --- END: QUANTITY & PRICE CHECKS ---

			// Build update map - only update fields that are provided
			updateMap := make(map[string]interface{})

			if item.Name != "" {
				updateMap["name"] = item.Name
			}
			if item.Description != "" {
				updateMap["description"] = item.Description
			}
			// Quantity: 0 is a valid value, so use pointer or check if field was sent
			// We'll use a pointer in the model to detect if quantity was sent
			if item.Quantity != nil {
				updateMap["quantity"] = *item.Quantity
			}
			if item.Price != nil {
				updateMap["price"] = *item.Price
			}
			if item.CategoryID != nil {
				updateMap["category_id"] = item.CategoryID
			}

			if len(updateMap) > 0 {
				db.Model(&product).Updates(updateMap)
				// Fetch the updated product
				db.Where("id = ? AND user_id = ?", item.ID, userID).First(&product)
			}

			updated = append(updated, product)
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(updated)
	}
}

func BulkDeleteHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		userID, ok := r.Context().Value("user_id").(uint)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
			return
		}

		var req models.BulkDeleteRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}

		if len(req.IDs) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "No IDs provided"})
			return
		}

		result := db.Where("id IN ? AND user_id = ?", req.IDs, userID).Delete(&models.Product{})
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Products deleted successfully",
			"count":   string(rune(result.RowsAffected)),
		})
	}
}
