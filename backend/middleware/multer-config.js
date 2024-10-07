const multer = require('multer');

const MYME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',  // Correction ici
    'image/png': 'png',    // Correction ici
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        let name = file.originalname.split(' ').join('_');
        // Retire l'extension existante s'il y en a une
        name = name.replace(/\.[^/.]+$/, "");
        const extension = MYME_TYPES[file.mimetype];
        if (extension) {
            callback(null, name + Date.now() + '.' + extension);
        } else {
            callback(new Error("Type de fichier non supporté"), null);
        }
    }
});

module.exports = multer({ storage }).single('image');
