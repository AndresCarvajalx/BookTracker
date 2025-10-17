package controller

import (
	"net/http"
	"strconv"

	"github.com/AndresCarvajalx/BookTracker/repositories"
	"github.com/gin-gonic/gin"
)

func GetUser(c *gin.Context) {
	userId, e := c.Get("user_id")

	if !e {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var id string = strconv.Itoa(int(userId.(uint)))
	user, err := repositories.FindUserByID(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error getting user"})
		return
	}

	c.JSON(http.StatusAccepted, user)
}

func UpdateUser(c *gin.Context) {
	userId, e := c.Get("user_id")
	if !e {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	var id string = strconv.Itoa(int(userId.(uint)))
	userData, err := repositories.FindUserByID(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error getting user"})
		return
	}

	if err := c.ShouldBindJSON(&userData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON provided"})
		return
	}

	updatedUser, err := repositories.UpdateUser(id, &userData)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error updating user"})
		return
	}

	c.JSON(http.StatusAccepted, updatedUser)
}
