package controller

import (
	"net/http"
	"os"
	"strconv"

	"github.com/AndresCarvajalx/BookTracker/models"
	"github.com/AndresCarvajalx/BookTracker/services"
	"github.com/gin-gonic/gin"
)

var PDFFolder string = "uploads/pdfs/"
var CoverFolder string = "uploads/covers/"

// TODO Unique file names for pdf and
// TODO Sanitize file names
func UpdateBookCover(c *gin.Context) {
	cover, errCover := c.FormFile("cover")
	bookId := c.Param("book_id")
	userId := c.Param("user_id")

	if errCover != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errCover.Error()})
		return
	}

	if cover == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no cover file provided"})
		return
	}

	path := CoverFolder + bookId + "_" + cover.Filename

	if err := os.MkdirAll(CoverFolder, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create directory"})
		return
	}

	if err := c.SaveUploadedFile(cover, path); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	book := models.Book{
		CoverPath: &path,
	}

	if err := services.UpdateBook(userId, bookId, &book); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cover updated", "cover_path": path})
}

func UpdateBookFile(c *gin.Context) {
	pdf, errPDF := c.FormFile("pdf")
	bookId := c.Param("book_id")
	userId := c.Param("user_id")

	if errPDF != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errPDF.Error()})
		return
	}

	if pdf == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no pdf file provided"})
		return
	}

	path := PDFFolder + bookId + "_" + pdf.Filename

	if err := os.MkdirAll(PDFFolder, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create directory"})
		return
	}

	if err := c.SaveUploadedFile(pdf, path); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	book := models.Book{
		PDFPath: &path,
	}

	if err := services.UpdateBook(userId, bookId, &book); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "pdf updated", "pdf_path": path})
}

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

	userId := c.Param("user_id") // TODO authentication with JWT

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

	book, err := services.GetBook(userId, bookId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if book.PDFPath != nil {
		os.Remove(*book.PDFPath)
	}

	if book.CoverPath != nil {
		os.Remove(*book.CoverPath)
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

func GetBookFile(c *gin.Context) {
	bookId := c.Param("book_id")
	userId := c.Param("user_id")

	book, err := services.GetBook(userId, bookId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if book.PDFPath == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no pdf found for this book"})
		return
	}

	c.File(*book.PDFPath)
}

func GetBookCover(c *gin.Context) {
	bookId := c.Param("book_id")
	userId := c.Param("user_id")

	book, err := services.GetBook(userId, bookId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if book.CoverPath == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no cover found for this book"})
		return
	}

	c.File(*book.CoverPath)
}
