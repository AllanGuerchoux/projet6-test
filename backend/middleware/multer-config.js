const multer = require('multer');

const MYME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',  
    'image/png': 'png',   
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        let name = file.originalname.split(' ').join('_');
        name = name.replace(/\.[^/.]+$/, "");
        const extension = MYME_TYPES[file.mimetype];
        if (extension) {
            callback(null, name + Date.now() + '.' + extension);
        } else {
            callback(new Error("Type de fichier non supporté"), null);
        }
    }
});

const upload = multer({
    storage: storage,
     
});

// Exportez l'instance de multer
module.exports = upload.single('image');