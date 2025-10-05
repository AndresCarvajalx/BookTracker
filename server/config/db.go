package config

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error

	var dbName string = "booktracker"
	var username string = "root"
	var password string = ""
	var port string = "3306"

	var dns string = username + ":" + password + "@tcp(localhost:" + port + ")/" + dbName + "?parseTime=true"

	DB, err = gorm.Open(mysql.New(mysql.Config{
		DSN: dns}), &gorm.Config{})

	if err != nil {
		log.Println("\033[31m===============================\033[0m")
		log.Println("\033[31mError connecting to database\033[0m")
		log.Println("\033[31m===============================\033[0m")
		log.Fatalln(err.Error())
	}

	log.Println("\033[32m==================================\033[0m")
	log.Println("\033[32mConnected to database successfully\033[0m")
	log.Println("\033[32m==================================\033[0m")
}
