package routes

import (
	"github.com/AndresCarvajalx/BookTracker/controller"
	_ "github.com/AndresCarvajalx/BookTracker/middleware"
	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	auth := r.Group("/auth")
	//auth.Use(middleware.AuthMiddleware())
	{
		auth.POST("/register", controller.Register)
		auth.POST("/login", controller.Login)
		//auth.GET("/validate", controller.ValidateMilddleware)
	}
}
