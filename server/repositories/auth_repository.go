package repositories

import (
	"github.com/AndresCarvajalx/BookTracker/config"
	"github.com/AndresCarvajalx/BookTracker/models"
)

func CreateUser(user *models.User) error {
	return config.DB.Create(user).Error
}
