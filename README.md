
# A Movie API - backend
  

## Description


A REST API that connects to a NoSQL database with access to information about different movies, directors, genres and users. Users are able to sign up, update personal information, and create a list of favorite movies. The project uses the MERN stack (MongoDB, Express, React, and Node.js).

  


###  User Features

* Return a list of all movies to the user

* Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user

* Return data about a genre (description) by name/title (e.g., “Drama”)

* Return data about a director (name, bio, birth year, death year) by name

* Allow new users to register

* Allow users to update their user info (username, password, email, date of birth)

* Allow users to add a movie to their list of favorites

* Allow users to remove a movie from their list of favorites

* Allow existing users to deregister



###  Technical Features

* Node.js and Express

* REST architecture, with URL endpoints corresponding to the data operations listed above

* Middleware modules, such as the body-parser package for reading data from requests and morgan for logging

* The database is built using MongoDB

* The business logic is modeled with Mongoose

* Movie information is in JSON format

* Tested in Postman

* Includes user authentication and authorization code

* Includes data validation logic 

* Source code is publically deployed to GitHub and [Heroku](https://jessica-chastain-movies.herokuapp.com/)


