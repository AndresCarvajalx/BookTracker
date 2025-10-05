package routes

import (
	"github.com/AndresCarvajalx/BookTracker/controller"
	"github.com/gin-gonic/gin"
)

func BookRoutes(r *gin.Engine) {
	books := r.Group("/users/:user_id/books")
	{
		books.GET("/", controller.GetBooks)
		books.GET("/:book_id", controller.GetBookByID)
		books.POST("/", controller.AddBook)
		books.DELETE("/:book_id", controller.DeleteBook)
		books.PUT("/:book_id", controller.UpdateBook)
	}
}
