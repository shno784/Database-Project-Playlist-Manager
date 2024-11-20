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
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
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

#Input dummy data
INSERT INTO users (username, firstname, lastname, email, hashedpassword)
VALUES 
('john_doe', 'John', 'Doe', 'john.doe@example.com', 'hashed_password_123'),
('jane_smith', 'Jane', 'Smith', 'jane.smith@example.com', 'hashed_password_456'),
('admin', 'Alice', 'Brown', 'alice.brown@example.com', 'admin');

INSERT INTO playlists (name, user_id)
VALUES 
('Chill Vibes', 1),  
('Workout Hits', 2), 
('Relaxing Piano', 3),
('Party Anthems', 1),  
('Road Trip Tunes', 2),
('Jazz Classics', 3),  
('Focus Beats', 1),    
('Feel Good Hits', 2), 
('Acoustic Chill', 3); 

INSERT INTO playlist_songs (playlist_id, song_name, song_artist)
VALUES 
(1, 'Blinding Lights', 'The Weeknd'),       
(1, 'Levitating', 'Dua Lipa'),              
(2, 'Eye of the Tiger', 'Survivor'),        
(2, 'Stronger', 'Kanye West'),              
(3, 'River Flows in You', 'Yiruma'),        
(4, 'Uptown Funk', 'Mark Ronson ft. Bruno Mars'),
(4, 'Can’t Stop the Feeling!', 'Justin Timberlake'),
(4, '24K Magic', 'Bruno Mars'),
(5, 'Life is a Highway', 'Rascal Flatts'),
(5, 'On the Road Again', 'Willie Nelson'),
(5, 'Take It Easy', 'Eagles'),
(6, 'Take Five', 'Dave Brubeck'),
(6, 'So What', 'Miles Davis'),
(6, 'Blue in Green', 'Miles Davis'),
(7, 'Weightless', 'Marconi Union'),
(7, 'Pure Shores', 'All Saints'),
(7, 'Electric Relaxation', 'A Tribe Called Quest'),
(8, 'Happy', 'Pharrell Williams'),
(8, 'Best Day of My Life', 'American Authors'),
(8, 'Shut Up and Dance', 'WALK THE MOON'),
(9, 'Skinny Love', 'Bon Iver'),
(9, 'Tenerife Sea', 'Ed Sheeran'),
(9, 'Banana Pancakes', 'Jack Johnson');


INSERT INTO liked_songs (user_id, name, artist)
VALUES 
(1, 'Stay', 'The Kid LAROI'),      
(1, 'Bad Habits', 'Ed Sheeran'),   
(2, 'Shape of You', 'Ed Sheeran'), 
(3, 'Bohemian Rhapsody', 'Queen'), 
(3, 'Someone Like You', 'Adele'),  
(1, 'Lose Yourself', 'Eminem'),
(1, 'Rolling in the Deep', 'Adele'),
(1, 'Hotel California', 'Eagles'),
(2, 'Thinking Out Loud', 'Ed Sheeran'),
(2, 'Blowin’ in the Wind', 'Bob Dylan'),
(2, 'Despacito', 'Luis Fonsi ft. Daddy Yankee'),
(3, 'Imagine', 'John Lennon'),
(3, 'Dreams', 'Fleetwood Mac'),
(3, 'Yesterday', 'The Beatles'),
(1, 'Shallow', 'Lady Gaga & Bradley Cooper'),
(2, 'Dynamite', 'BTS'),
(3, 'Let It Be', 'The Beatles');
