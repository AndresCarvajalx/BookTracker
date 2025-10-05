package controller

import (
	"net/http"
	"strconv"

	"github.com/AndresCarvajalx/BookTracker/models"
	"github.com/AndresCarvajalx/BookTracker/services"
	"github.com/gin-gonic/gin"
)

func GetBooks(c *gin.Context) {
	userId := c.Param("user_id")

	if len(userId) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id header is required"})
		return
	}

	books, err := services.GetBooks(userId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(books) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "no books found for this user"})
		return
	}

	c.JSON(http.StatusOK, books)
}

func GetBookByID(c *gin.Context) {
	userId, bookId := c.Param("user_id"), c.Param("book_id")

	book, err := services.GetBook(userId, bookId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, book)
}

func AddBook(c *gin.Context) {
	var book models.Book

	userId := c.Param("user_id")

	id, err := strconv.Atoi(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	book.UserID = uint(id)

	if book.Title == "" || book.Author == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title and author are required"})
		return
	}

	if err := services.AddBook(&book); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, book)
}

func DeleteBook(c *gin.Context) {
	userId, bookId := c.Param("user_id"), c.Param("book_id")

	if _, err := strconv.Atoi(userId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	if _, err := strconv.Atoi(bookId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid book_id"})
		return
	}

	if err := services.DeleteBook(userId, bookId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "book deleted successfully"})
}

func UpdateBook(c *gin.Context) {
	userId := c.Param("user_id")
	bookId := c.Param("book_id")

	var book models.Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := services.UpdateBook(userId, bookId, &book); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "book updated successfully"})
}
