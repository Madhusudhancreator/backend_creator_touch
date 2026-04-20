const router       = require('express').Router();
const usersCtrl    = require('../controllers/usersController');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/',              authenticate, requireAdmin, usersCtrl.getAll);
router.get('/pending',       authenticate, requireAdmin, usersCtrl.getPending);
router.patch('/:id/approve', authenticate, requireAdmin, usersCtrl.approve);
router.patch('/:id/reject',  authenticate, requireAdmin, usersCtrl.reject);
router.delete('/:id',        authenticate, requireAdmin, usersCtrl.remove);

module.exports = router;
