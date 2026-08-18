package models

import (
	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	Email    string    `gorm:"unique" json:"email"`
	Password string    `json:"-"`
	Products []Product `gorm:"foreignKey:UserID"`
}

type Category struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	UserID   uint      `json:"user_id"`
	Name     string    `json:"name"`
	Products []Product `gorm:"foreignKey:CategoryID"`
}

type Product struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	UserID      uint    `json:"user_id"`
	CategoryID  *uint   `json:"category_id"` // Optional foreign key
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
}

type BulkCreateRequest struct {
	Products []ProductInput `json:"products"`
}

type ProductInput struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
	CategoryID  *uint   `json:"category_id"` // Add this
}

type BulkUpdateRequest struct {
	Products []BulkUpdateItem `json:"products"`
}

type BulkUpdateItem struct {
	ID          uint     `json:"id"`
	Name        string   `json:"name,omitempty"`
	Description string   `json:"description,omitempty"`
	Quantity    *int     `json:"quantity,omitempty"`
	Price       *float64 `json:"price,omitempty"`
	CategoryID  *uint    `json:"category_id,omitempty"`
}

type BulkDeleteRequest struct {
	IDs []uint `json:"ids"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}
