package main

import (
	"github.com/AndresCarvajalx/BookTracker/config"
	"github.com/AndresCarvajalx/BookTracker/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	clientPort := ":5173"

	router := gin.Default()

	config.Connect()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost" + clientPort},
		AllowMethods:     []string{"POST", "GET", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.BookRoutes(router)
	routes.AuthRoutes(router)

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	router.Run(":8000")
}
