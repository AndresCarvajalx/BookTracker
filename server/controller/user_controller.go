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
