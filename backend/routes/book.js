const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const multer = require('../middleware/multer-config.js');
const bookCtrl = require('../controllers/books.js');


router.post('/',auth , multer ,bookCtrl.createBook);
router.get('/' ,bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.bestrating);
router.get('/:id' ,bookCtrl.getOneBook);
router.put('/:id',auth, multer ,bookCtrl.updateBook);
router.delete('/:id',auth ,bookCtrl.deleteBook);

router.post('/:id/rating',  bookCtrl.addRating);




module.exports = router;