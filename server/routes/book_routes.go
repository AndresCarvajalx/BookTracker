package routes

import (
	"github.com/AndresCarvajalx/BookTracker/controller"
	"github.com/AndresCarvajalx/BookTracker/middleware"
	"github.com/gin-gonic/gin"
)

func BookRoutes(r *gin.Engine) {
	books := r.Group("/books")
	books.Use(middleware.AuthMiddleware())
	{
		books.GET("/", controller.GetBooks)
		books.GET("/:book_id", controller.GetBookByID)
		books.POST("/", controller.AddBook)
		books.DELETE("/:book_id", controller.DeleteBook)
		books.PUT("/:book_id", controller.UpdateBook)
		books.GET("/:book_id/pdf", controller.GetBookFile)
		books.GET("/:book_id/cover", controller.GetBookCover)
		books.PUT("/:book_id/pdf", controller.UpdateBookFile)
		books.PUT("/:book_id/cover", controller.UpdateBookCover)
	}
}
