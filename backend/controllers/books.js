const Book = require('../models/Book.js');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    console.log(bookObject)
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
    console.log(book)
    book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => res.status(400).json({ error }));
      
  };

  exports.updateBook = (req, res, next) => {
    console.log("Requête reçue:", req.params.id); // Pour vérifier l'ID du livre
    console.log("Corps de la requête:", req.body); // Pour voir le contenu de req.body
    console.log("Fichier reçu:", req.file); // Pour vérifier si un fichier a été reçu

    // Vérifie si un fichier a été téléchargé et construit bookObject en conséquence
    const bookObject = req.file 
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } 
        : { ...req.body }; // Utilisation de req.body si pas de fichier

    console.log("Objet livre construit:", bookObject); // Pour voir l'objet livre après construction

    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                console.log("Livre non trouvé"); // Pour vérifier si le livre existe
                return res.status(404).json({ message: 'Livre non trouvé' });
            }

            if (book.userId !== req.auth.userId) {
                console.log("Utilisateur non autorisé"); // Pour vérifier les droits d'accès
                return res.status(403).json({ message: 'non-authorisé' });
            }

            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => {
                    console.log("Livre modifié avec succès"); // Pour confirmer la mise à jour
                    res.status(200).json({ message: 'Livre modifié' });
                })
                .catch(error => {
                    console.error("Erreur lors de la mise à jour:", error); // Pour afficher l'erreur de mise à jour
                    res.status(400).json({ error });
                });
        })
        .catch(error => {
            console.error("Erreur lors de la recherche du livre:", error); // Pour afficher l'erreur de recherche
            res.status(400).json({ error });
        });
};

exports.deleteBook =  (req, res, next) =>{ //supprime le livre et son image avec son id assosié
    Book.findOne({_id: req.params.id})
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
};

exports.getAllBooks = (req, res, next) => { // Renvoie un tableau de tout les livres de la base de données
    Book.find()
    .then( books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
};
exports.addRating = async (req, res) => {
    const { userId, rating } = req.body;

    if (!userId || rating === undefined) {
        return res.status(400).json({ message: 'UserId and rating are required' });
    }

    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Vérifier si l'utilisateur a déjà noté ce livre
        const existingRating = book.ratings.find(r => r.userId === userId);
        if (existingRating) {
            return res.status(400).json({ message: 'User has already rated this book' });
        }

        // Ajouter la nouvelle note
        book.ratings.push({ userId, grade: rating });

        // Recalculer la moyenne
        const totalRating = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        const averageRating = totalRating / book.ratings.length;

        // Mettre à jour la moyenne dans le livre
        book.averageRating = averageRating;

        // Enregistrer les modifications
        const updatedBook = await book.save();

        // Renvoie le livre mis à jour
        return res.status(200).json({ 
            message: 'Rating added successfully', 
            averageRating, 
            book: updatedBook // Renvoie le livre mis à jour
        });
    } catch (error) {
        console.error('Error adding rating:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};
  exports.bestrating = async (req, res) => {
    try {
        const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
        // Assure-toi que tu renvoies un tableau
        res.status(200).json(bestRatedBooks);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
    }
};