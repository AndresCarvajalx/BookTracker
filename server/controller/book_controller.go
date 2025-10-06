package controller

import (
	"encoding/base64"
	"net/http"
	"os"
	"strconv"
	"strings"

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

	if book.PDFPath != nil && *book.PDFPath != "" {
		dec, err := base64.StdEncoding.DecodeString(*book.PDFPath)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		uploadPath := "uploads/" + userId + "_" + book.Title

		f, err := os.Create(uploadPath)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		defer f.Close()

		if _, err := f.Write(dec); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		if err := f.Sync(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		book.PDFPath = &uploadPath
	}

	if book.CoverImage != nil && *book.CoverImage != "" {
		if path, err := saveBase64File(*book.CoverImage, "uploads/", userId+"_"+book.Title+"_cover"); err == nil {
			book.CoverImage = &path
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
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
	if book.CoverImage != nil {
		os.Remove(*book.CoverImage)
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

func saveBase64File(data string, folder string, filename string) (string, error) {
	parts := strings.Split(data, ",")
	var dec []byte
	var err error
	if len(parts) > 1 {
		dec, err = base64.StdEncoding.DecodeString(parts[1])
	} else {
		dec, err = base64.StdEncoding.DecodeString(parts[0])
	}
	if err != nil {
		return "", err
	}

	if _, err := os.Stat(folder); os.IsNotExist(err) {
		os.MkdirAll(folder, os.ModePerm)
	}

	ext := ".bin"
	if strings.Contains(data, "image/jpeg") {
		ext = ".jpg"
	} else if strings.Contains(data, "image/png") {
		ext = ".png"
	} else if strings.Contains(data, "application/pdf") {
		ext = ".pdf"
	}

	path := folder + filename + ext
	f, err := os.Create(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	if _, err := f.Write(dec); err != nil {
		return "", err
	}

	if err := f.Sync(); err != nil {
		return "", err
	}

	return path, nil
}

func GetBookFile(c *gin.Context) {
	bookId := c.Param("book_id")
	userId := c.Param("user_id")

	book, err := services.GetBook(userId, bookId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if book.PDFPath == nil || *book.PDFPath == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "No PDF available"})
		return
	}

	data, err := os.ReadFile(*book.PDFPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	base64Data := base64.StdEncoding.EncodeToString(data)
	c.JSON(http.StatusOK, gin.H{
		"id":          book.ID,
		"title":       book.Title,
		"pdf_base64":  base64Data,
		"cover_image": book.CoverImage,
		"author":      book.Author,
		"status":      book.Status,
	})
}
