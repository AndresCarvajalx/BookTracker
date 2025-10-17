package repositories

import (
	"github.com/AndresCarvajalx/BookTracker/config"
	"github.com/AndresCarvajalx/BookTracker/models"
)

func FindUserByID(id string) (models.User, error) {
	var users models.User
	result := config.DB.Where("id = ?", id).First(&users)
	return users, result.Error
}
