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

	user.Password = ""

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

	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON provided"})
		return
	}

	if input.Username != "" {
		userData.Username = input.Username
	}
	if input.Email != "" {
		userData.Email = input.Email
	}

	updatedUser, err := repositories.UpdateUser(id, &userData)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error updating user"})
		return
	}

	updatedUser.Password = ""

	c.JSON(http.StatusAccepted, updatedUser)
}
