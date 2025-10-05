package services

import (
	"github.com/AndresCarvajalx/BookTracker/models"
	"github.com/AndresCarvajalx/BookTracker/repositories"
)

func RegisterUser(user *models.User) error {
	return repositories.CreateUser(user)
}
