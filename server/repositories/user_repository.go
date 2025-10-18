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

func UpdateUser(id string, userData *models.User) (models.User, error) {
	var user models.User

	result := config.DB.Model(&user).Where("id = ?", id).Updates(userData)
	if result.Error != nil {
		return user, result.Error
	}

	fetch := config.DB.Where("id = ?", id).First(&user)
	return user, fetch.Error
}
