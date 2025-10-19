package config

import (
	"log"
	"time"
	
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error

	var dbName string = "booktracker"
	var username string = "root"
	var password string = "root"
	var port string = "3306"
	var host string = "db-master"

	var dsn string = username + ":" + password + "@tcp(" + host + ":" + port + ")/" + dbName + "?parseTime=true"
	
	for i := 0; i < 10; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("\033[32m==================================\033[0m")
			log.Println("\033[32mConnected to database successfully\033[0m")
			log.Println("\033[32m==================================\033[0m")
			return
		}

		log.Printf("Waiting for database to be ready... (%d/10)\n", i+1)
		time.Sleep(5 * time.Second)
	}

	log.Println("\033[32m============================\033[0m")
	log.Println("\033[32mError connecting to database\033[0m")
	log.Println("\033[32m============================\033[0m")
}
