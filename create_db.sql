# Create database script for playlist_manager

# Create the database
CREATE DATABASE IF NOT EXISTS playlist_manager;
USE playlist_manager;

# Create the tables
CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));

# Create the app user
CREATE USER IF NOT EXISTS 'playlist_manager_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON playlist_manager.* TO ' playlist_manager_app'@'localhost';

#Create user database
CREATE TABLE IF NOT EXISTS users(id INT AUTO_INCREMENT,username VARCHAR(50),firstname VARCHAR(50),lastname VARCHAR(50),email VARCHAR(50),hashedpassword TEXT,PRIMARY KEY(id));