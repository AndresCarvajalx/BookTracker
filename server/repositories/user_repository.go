package repositories

import (
	"github.com/AndresCarvajalx/BookTracker/config"
	"github.com/AndresCarvajalx/BookTracker/models"
	"gorm.io/gorm/clause"
)

func FindUserByID(id string) (models.User, error) {
	var users models.User
	result := config.DB.Where("id = ?", id).First(&users)
	return users, result.Error
}

func UpdateUser(id string, userData *models.User) (models.User, error) {
	var user models.User

	result := config.DB.Model(&models.User{}).
		Where("id = ?", id).
		Clauses(clause.Returning{}).
		Updates(userData).
		Scan(&user)

	return user, result.Error
}
