const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage(); // Utilisation de memoryStorage pour le buffer temporaire

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        const mimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        if (mimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Type de fichier non supporté"), false);
        }
    }
}).single('image');

// Middleware pour optimiser l'image après l'upload et convertir en WebP
const optimizeImage = (req, res, next) => {
    if (!req.file) {
        return next(); // Aucun fichier à optimiser
    }

    const name = req.file.originalname.split(' ').join('_').replace(/\.[^/.]+$/, "");
    const fileName = `${name}_${Date.now()}.webp`; // Sauvegarder avec l'extension .webp
    const filePath = path.join('images', fileName);

    sharp(req.file.buffer)
        .resize({ width: 800 }) // Redimensionner à 800px de large
        .toFormat('webp', { quality: 80 }) // Conversion en WebP avec qualité de 80
        .toFile(filePath) // Sauvegarder le fichier optimisé en WebP
        .then(() => {
            // Ajouter le chemin optimisé à la requête
            req.file.optimizedPath = filePath;
            next();
        })
        .catch((error) => {
            console.error("Erreur lors de l'optimisation de l'image :", error);
            next(error); // Passer l'erreur au middleware d'erreur
        });
};

// Exporter l'upload et l'optimisation
module.exports = { upload, optimizeImage };
