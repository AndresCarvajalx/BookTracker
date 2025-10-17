package routes

import (
	"github.com/AndresCarvajalx/BookTracker/controller"
	"github.com/AndresCarvajalx/BookTracker/middleware"
	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {
	routes := r.Group("/user")
	routes.Use(middleware.AuthMiddleware())
	{
		routes.GET("/", controller.GetUser)
	}
}
