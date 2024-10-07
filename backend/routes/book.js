const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const multer = require('../middleware/multer-config.js');
const bookCtrl = require('../controllers/books.js');


router.post('/',auth , multer ,bookCtrl.createBook);
router.get('/bestrating', bookCtrl.bestrating);
router.get('/' ,bookCtrl.getAllBooks);
router.post('/:id/rating',  bookCtrl.addRating);
router.put('/:id',auth, multer ,bookCtrl.updateBook);
router.delete('/:id',auth ,bookCtrl.deleteBook);
router.get('/:id' ,bookCtrl.getOneBook);




module.exports = router;