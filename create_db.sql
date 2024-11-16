# Create database script for playlist_manager

# Create the database
CREATE DATABASE IF NOT EXISTS playlist_manager;
USE playlist_manager;


# Create the app user
CREATE USER IF NOT EXISTS 'playlist_manager_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON playlist_manager.* TO ' playlist_manager_app'@'localhost';

#Create user database
CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT,
    username VARCHAR(50),
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    email VARCHAR(50),
    hashedpassword TEXT,
    PRIMARY KEY(id));

#Create playlist  table
CREATE TABLE IF NOT EXISTS  playlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  user_id INT, -- Foreign key to users
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

#Create playlist songs  table
CREATE TABLE IF NOT EXISTS playlist_songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playlist_id INT NOT NULL,          
  song_name VARCHAR(255) NOT NULL,    
  song_artist VARCHAR(255) NOT NULL,   
  FOREIGN KEY (playlist_id) REFERENCES playlists(id)
);

#Create liked songs table
CREATE TABLE IF NOT EXISTS liked_songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255),
  artist VARCHAR(255),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

