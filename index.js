const mongoose = require('mongoose');
const Models = require('./models.js');

//requires Movie and User models defined in models.js
const Movies = Models.Movie;
const Users = Models.User;

//connects this API to our movieDB database
// mongoose.connect('mongodb://127.0.0.1:27017/movieDB', { useNewUrlParser: true, useUnifiedTopology: true }); //important that this part goes after the above requirements
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }); //important that this part goes after the above requirements


const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

app.use(express.json());

app.use(morgan('common'));

app.use(express.static('public'));


/**
 * GET welcome page from '/' endpoint
 * @name welcomePage
 * @kind function
 * @returns Welcome page
 */
app.get('/', (req, res) => {
    res.send ('Enjoy the best movies starring Jessica Chastain!');
});

/**
 * Create a new user (CREATE)
 * Request body: A JSON object holding data about the new user, containing username, password, email and birthday. 
 * @name createUser
 * @kind function
 * @returns A JSON object holding data of the new user.
 * @requires passport
 */
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
      let hashedPassword = Users.hashPassword(req.body.Password);
      Users.findOne({ Username: req.body.Username })
        .then((user) => {
          if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
          } else {
            Users
              .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
                FavoriteMovies: req.body.FavoriteMovies
              })
              .then((user) =>{res.status(201).json(user)})
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
  });

  /**
 * READ:get full user list
 * Request body: None
 * @name getAllUsers
 * @kind function
 * @returns A JSON object holding data of all the users.
 * @requires passport
 */
app.get('/users',passport.authenticate('jwt', {session: false}), (req,res)=>{
  Users.find()
  .then((users)=>{
      res.status(200).json(users);
  })
  .catch((err)=>{
      console.log(err);
      res.status(500).send('Error: ' + err);
  });
});


/**
 * READ: get data of a single user
 * Request body: None
 * @name getUser
 * @kind function
 * @param {string} Username
 * @returns A JSON object holding data of the particular user.
 * @requires passport
 */
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res)=> {
    Users.findOne({Username: req.params.Username})
    .then((user)=>{
        if(user){
            res.status(200).json(user);    
        } else {
            res.status(404).send(`Username "${req.params.Username}" not found.`);
        }
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).send('Error: ' + err);
    });
});


/**
 * Add a movie to a user's list of favorites (POST)
 * Request body: None 
 * @name addFavoriteMovie
 * @kind function
 * @param {string} Username
 * @param {string} MovieID
 * @returns A JSON object holding the updated data of the user.
 * @requires passport
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $push: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }, 
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

/**
 * Delete a movie from a user's list of favorites (DELETE)
 * @name deleteFavoriteMovie
 * @kind function
 * @param {string} Username
 * @param {string} MovieID
 * @returns A JSON object holding the updated user data.
 * @requires passport
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $pull: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }, 
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

/**
 * Delete an existing user (DELETE)
 * @name deleteUser
 * @kind function
 * @param {string} Username
 * @returns A text message indicating the user's data has been removed.
 * @requires passport
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

/**
 * Update a user's info (UPDATE)
 * Request body: 	A JSON object holding the updated user information. 
 * @name updateUser
 * @kind function
 * @param {string} Username
 * @returns A JSON object holding the updated user information.
 * @requires passport
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), 
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
        FavoriteMovies: req.body.FavoriteMovies
      }
    },
    { new: true }, 
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

/**
 * Get full movie list (READ)
 * @name getAllMovies
 * @kind function
 * @returns A JSON object holding data of all movies. 
 * @requires passport
 */
app.get('/movies', /*passport.authenticate('jwt', { session: false }),*/ (req, res) => {
    Movies.find().then(movies=>res.json(movies))
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
  
/**
 * Get details of a single movie (READ)
 * Request body: None
 * @name getOneMovie
 * @kind function
 * @param {string} Title 
 * @returns A JSON object holding data about a single movie, containing title, description, genre, director, imageURL and feutured or not.
 * @requires passport
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({Title: req.params.Title})
    .then(movie => res.json(movie))
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * Get data about a genre by name (READ)
 * @name getGenre
 * @kind function
 * @returns A JSON object holding data about a single genre, containing name and description.
 * @requires passport
 */
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({'Genre.Name':req.params.genreName})
    .then(movie => res.json(movie.Genre))
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * Get data about a director by name (READ)
 * @name getDirector
 * @kind function
 * @returns A JSON object holding data about a single director, containing name, bio, birth year and death year.
 * @requires passport
 */
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({'Director.Name':req.params.directorName})
    .then(movie => res.json(movie.Director))
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});


/**
 * Error handler
 * @name errorHandler
 * @kind function
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oh no, something broke!');
  });

  
/**
 * Request listener
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
});