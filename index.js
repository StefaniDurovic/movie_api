const express = require('express'),
morgan = require('morgan');

const app = express();

let top10movies = [
    {
        title: 'The Tree of Life',
        director: 'Terrence Malick'
    },

    {
        title: 'A Most Violent Year',
        director: 'J.C.Chandor'
    },

    {
        title: 'Miss Sloane',
        director: 'John Madden'
    },

    {
        title: 'Zero Dark Thirty',
        director: 'Kathryn Bigelow'
    },

    {
        title: 'Molly\'s Game',
        director: 'Aaron Sorkin'
    }
];

app.get('/movies', (req, res) => {
    res.json (top10movies);
});

app.get('/', (req, res) => {
    res.send ('Enjoy the best movies starring Jessica Chastain!');
});

app.use(express.static('public'));

app.use(morgan('common'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oh no, something broke!');
  });

app.listen (8080, () => {
    console.log('Your app is listening');
});