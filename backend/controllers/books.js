const Book = require('../models/Book.js');
const fs = require('fs');
const auth = require('../middleware/auth.js')
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    console.log(bookObject);
    bookObject.id = 'id' + (new Date()).getTime();
    delete bookObject._id;
    delete bookObject._userId;
  
    // Validation des notes
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
        imageUrl: `${req.protocol}://${req.get('host')}/${req.file.optimizedPath.replace(/\\/g, '/')}`,  // Utiliser le chemin optimisé
        ratings: ratings,  // Initialiser les notes
        averageRating: averageRating  // Calculer la moyenne
      });
  
      console.log(book);
  
      // Sauvegarder le livre
      book.save()
        .then((savedBook) => {
          // Copier l'_id sous la propriété id
          const bookWithId = {
            ...savedBook._doc, // Utiliser _doc pour accéder aux propriétés MongoDB
            id: savedBook._id.toString()  // Ajouter l'_id en tant que id
          };
          delete bookWithId._id;  // Supprimer la propriété _id si tu ne veux pas la renvoyer
          res.status(201).json({
            message: 'Livre enregistré !',
            book: bookWithId  // Retourne l'objet book avec id
          });
        })
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
            imageUrl: `${req.protocol}://${req.get('host')}/${req.file.optimizedPath.replace(/\\/g, '/')}`
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
exports.addRating =  (req, res, next) => {
    const userId = req.body.userId;
    const grade = req.body.rating;
    if (grade < 0 || grade > 5) {
        return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    Book.findOne({_id: req.params.id})
    .then(book=>{
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const existingRating = book.ratings.find(r => r.userId === req.auth.userId);
        if (existingRating) {
            return res.status(400).json({ message: 'User has already rated this book' });
        }
        // Ajouter la nouvelle note
        book.ratings.push({ userId, grade});

        // Recalculer la moyenne
        const totalRating = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        book.averageRating = parseFloat((totalRating / book.ratings.length).toFixed(1));

       

        book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
            .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};
exports.bestrating = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(bestRatedBooks => {
            // Assure-toi que tu renvoies un tableau
            res.status(200).json(bestRatedBooks);
        })
        .catch(error => {
            res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
        });
};