package misc

import (
	"ims/models"
	"log"
	"time"

	"gorm.io/gorm"
)

// Pings every 600 seconds (10 minutes)
func Ping(db *gorm.DB) {
	ping(db)

	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		ping(db)
	}
}

func ping(db *gorm.DB) {
	if err := db.FirstOrCreate(&models.KeepAlive{}, models.KeepAlive{ID: 1}).Error; err != nil {
		log.Printf("Failed to seed keep_alive row: %v", err)
	}
	result := db.Model(&models.KeepAlive{ID: 1}).Update("last_ping", time.Now())
	if result.Error != nil {
		log.Printf("keep-alive ping failed: %v", result.Error)
	}
}
