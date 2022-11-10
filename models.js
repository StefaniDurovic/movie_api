const mongoose = require('mongoose');

//making schemas
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Released: {type: String, required: true},
    Genre: {
        Name: String, 
        Description: String
    },
    Director: {
        Name: {type: String, required: true},
        Bio: String,
        Birth: String,
        Death: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});


//making models
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);


//exporting models
module.exports.Movie = Movie;
module.exports.User = User;