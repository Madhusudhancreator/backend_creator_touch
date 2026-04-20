const router       = require('express').Router();
const authCtrl     = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');

router.post('/register', authCtrl.register);
router.post('/login',    authCtrl.login);
router.get('/me',        authenticate, authCtrl.me);

module.exports = router;
