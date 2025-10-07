package models

import (
	"time"
)

type Book struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `json:"user_id"`
	Title       string    `json:"title"`
	Author      string    `json:"author"`
	Genre       *string   `json:"genre"`
	CoverPath   *string   `json:"cover_path"`
	PDFPath     *string   `json:"pdf_path"`
	TotalPages  *int      `json:"total_pages"`
	CurrentPage *int      `json:"current_page"`
	Rating      *float64  `json:"rating"`
	Review      *string   `json:"review"`
	Premise     *string   `json:"premise"`
	Status      string    `json:"status" gorm:"type:enum('read', 'to_read', 'reading')"`
	CreatedAt   time.Time `json:"created_at"`
}
