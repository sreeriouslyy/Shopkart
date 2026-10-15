const router = require('express').Router();
const c = require('../controllers/customer.controller');
const protect = require('../middlewares/auth.middleware');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', protect, c.me);
router.post('/logout', protect, c.logout);
router.patch('/change-password', protect, c.changePassword);

module.exports = router;
