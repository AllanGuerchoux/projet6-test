const mongoose = require('mongoose')

const bookSchema = mongoose.Schema({
title:{type:String, required: true},
author:{type:String, required: true},
imageUrl:{type:String, required: true},
year:{type:Number, required: true},
userId:{type: String, required: true},
genre:{type:String, required: true},
ratings:[
    {
      userId: { type: String, required: true },  // Identifiant MongoDB unique de l'utilisateur qui a noté le livre
      grade: { type: Number, required: true }  // Note donnée à un livre
    }
  ],
averageRating:{type:Number, required: true}

});

module.exports = mongoose.model('Book', bookSchema);




  


