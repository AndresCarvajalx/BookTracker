package services

import (
	"github.com/AndresCarvajalx/BookTracker/models"
	"github.com/AndresCarvajalx/BookTracker/repositories"
)

func GetBooks(userId string) ([]models.Book, error) {
	return repositories.FindBooks(userId)
}

func GetBook(userId string, bookId string) (models.Book, error) {
	return repositories.FindBookByID(userId, bookId)
}

func AddBook(book *models.Book) error {
	return repositories.CreateBook(book)
}

func DeleteBook(userId string, bookId string) error {
	return repositories.DeleteBook(userId, bookId)
}

func UpdateBook(userId string, bookId string, updatedBook *models.Book) error {
	return repositories.UpdateBook(userId, bookId, updatedBook)
}
