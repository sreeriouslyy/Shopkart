const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const wishlistController = require('../controllers/wishlist.controller');

router.use(protect);

router.post('/:productId', wishlistController.addToWishlist);
router.get('/', wishlistController.getWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;
