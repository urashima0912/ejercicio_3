const { Router } = require('express');
const controllers = require('../controllers');

const router = Router();

router.post('/sign-up', controllers.user.signUp);
router.post('/sign-in', controllers.user.signIn);

module.exports = router;