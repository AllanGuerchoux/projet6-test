const multer = require('multer');

const MYME_TYPES = {
    'image/jpg': 'jpg',
    'images/jpeg':'jpg',
    'images/pgn':'png',
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MYME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');