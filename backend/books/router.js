const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const multer = require('../middleware/multer-config.js')
const bookCtrl = require('../controllers/books.js')


router.post('/',auth, multer ,bookCtrl.createBook);
router.put('/:id',auth, multer ,bookCtrl.modifyBook);
router.delete('/:id',auth ,bookCtrl.deleteBook);
router.get('/:id' ,bookCtrl.getOneBook);
router.get('/' ,bookCtrl.getAllBooks);


module.exports = router;