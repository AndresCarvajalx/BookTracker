package repositories

import (
	"github.com/AndresCarvajalx/BookTracker/config"
	"github.com/AndresCarvajalx/BookTracker/models"
)

func FindBooks(userId string) ([]models.Book, error) {
	var books []models.Book
	result := config.DB.Where("user_id = ?", userId).Find(&books)
	return books, result.Error
}

func FindBookByID(userId, bookId string) (models.Book, error) {
	var book models.Book
	result := config.DB.Where("user_id = ? AND id = ?", userId, bookId).First(&book)
	return book, result.Error
}

func CreateBook(book *models.Book) error {
	result := config.DB.Create(book)
	return result.Error
}

func DeleteBook(userId, bookId string) error {
	result := config.DB.Where("user_id = ? AND id = ?", userId, bookId).Delete(&models.Book{})
	return result.Error
}

func UpdateBook(userId string, bookId string, updatedBook *models.Book) error {
	var book models.Book
	result := config.DB.Where("id = ? AND user_id = ?", bookId, userId).First(&book)
	if result.Error != nil {
		return result.Error
	}

	result = config.DB.Model(&book).Updates(updatedBook)
	return result.Error
}
