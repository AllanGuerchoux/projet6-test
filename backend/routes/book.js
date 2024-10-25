const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const { upload, optimizeImage } = require('../middleware/multer-config.js');
const bookCtrl = require('../controllers/books.js');


router.post('/',auth ,upload, optimizeImage ,bookCtrl.createBook);
router.get('/' ,bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.bestrating);
router.get('/:id' ,bookCtrl.getOneBook);
router.put('/:id',auth,upload, optimizeImage ,bookCtrl.updateBook);
router.delete('/:id',auth ,bookCtrl.deleteBook);

router.post('/:id/rating',auth,  bookCtrl.addRating);




module.exports = router;