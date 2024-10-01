const Book = require('../models/Book.js');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
  
    // Ajouter une validation pour vérifier que les notes sont bien entre 0 et 5
    const ratings = bookObject.ratings || [];
    let totalRating = 0;
    let validRatings = true;
  
    ratings.forEach(rating => {
      if (rating.grade < 0 || rating.grade > 5) {
        validRatings = false;
      }
      totalRating += rating.grade;
    });
  
    if (!validRatings) {
      return res.status(400).json({ error: 'Les notes doivent être comprises entre 0 et 5.' });
    }
  
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
  
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ratings: ratings,  // Initialiser les notes
      averageRating: averageRating  // Calculer la moyenne
    });
  
    book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => res.status(400).json({ error }));
  };

exports.modifyBook = (req, res, next) =>{
    const bookObject = req.file ?{
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId){
                res.status(400).json({message :'non-authorisé'})
            } else {
                Book.updateOne()({_id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(()=> res.status(200).json({message : 'Livre modifié'}))
                .catch(error => res.status(400).json({error}));
            }
        })
        .catch(error => res.status(400).json({error}));
};

exports.deleteBook =  (req, res, next) =>{ //supprime le livre et son image avec son id assosié
    Book.findOne()({_id: req.params.id})
    .then(book=> {
        if(book.userId != req.auth.userId){
            res.status(401).json({message: 'non-authorisé'});
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`,()=> {
                Book.deleteOne({_id: req.params.id})
                .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                .catch(error => res.status(401).json({error})); 
            });
        }
    })
    .catch(error => res.status(500).json({error}));
};

exports.getOneBook = (req,res,next)=> {   //Renvoie le livre avec l'_id fourni
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({error}));
}

exports.getAllBooks = (req, res, next) => { // Renvoie un tableau de tout les livres de la base de données
    Book.find()
    .then( books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
}