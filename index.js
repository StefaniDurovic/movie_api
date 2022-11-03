const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');

const app = express();

let movies = [
    {
        title: 'The Tree of Life',
        director: 'Terrence Malick',
        genre: ['drama', 'fantasy', 'art']
    },

    {
        title: 'A Most Violent Year',
        director: 'J.C.Chandor',
        genre: ['action', 'crime', 'drama']
    },

    {
        title: 'Miss Sloane',
        director: 'John Madden',
        genre: ['drama']
    },

    {
        title: 'Zero Dark Thirty',
        director: 'Kathryn Bigelow',
        genre: ['thriller']
    },

    {
        title: 'Molly\'s Game',
        director: 'Aaron Sorkin',
        genre: ['biography', 'crime', 'drama']
    }
];

let users = [
    {
        id: 1,
        name: 'Susan',
        favoriteMovies: ['Miss Sloane', 'The Tree of Life']
    },

    {
        id: 2,
        name: 'Nick',
        favoriteMovies: ['Zero Dark Thirty']
    }
];

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send ('Enjoy the best movies starring Jessica Chastain!');
});

//CREATE new user
app.post('/users', (req, res) => {
    const newUser = req.body;  //this works because of the body-parser module

    if(newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('User\'s name has to be specified.')
    }
})

//CREATE new favorite movie for user
app.post('/users/:id/:movieTitle', (req, res) => {
    const {id, movieTitle} = req.params;

    let user = users.find (user => user.id == id);

    if(user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id} array.`)
    } else {
        res.status(400).send('User not found.')
    }
})

//DELETE a favorite movie for user
app.delete('/users/:id/:movieTitle', (req, res) => {
    const {id, movieTitle} = req.params;

    let user = users.find (user => user.id == id);

    if(user) {
        user.favoriteMovies = user.favoriteMovies.filter (title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id} array.`)
    } else {
        res.status(400).send('User not found.')
    }
})

//DELETE existing user
app.delete('/users/:id', (req, res) => {
    const {id} = req.params;

    let user = users.find (user => user.id == id);

    if(user) {
        users = users.filter (user => user.id != id);
        res.status(200).send(`User with id ${id} has been deleted.`)
    } else {
        res.status(400).send('User not found.')
    }
})

//UPDATE user info
app.put('/users/:id', (req, res) => {
    const {id} = req.params;
    const updatedUser = req.body;

    let user = users.find (user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('User not found.')
    }
});

//READ all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//READ movie details by title
app.get('/movies/:title', (req, res) => {
    const {title} = req.params;
    const movie = movies.find(movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('This movie was not found.');
    }
});

//READ genre by title
app.get('/movies/genre/:title', (req, res) => {
    const {title} = req.params;
    const genre = movies.find( movie => movie.title === title).genre; //.genre returns the the particular genre property of the movie object

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('This genre was not found.')
    }
});

//READ director details by title
app.get('/movies/director/:directorName', (req, res) => {
    const {directorName} = req.params;
    const director = movies.find( movie => movie.director === directorName).director; //.director returns the the particular genre property of the movie object

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('This director was not found.')
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oh no, something broke!');
  });

app.listen (8080, () => {
    console.log('Your app is listening');
});