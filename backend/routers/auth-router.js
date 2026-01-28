const express = require('express');
const authController = require('../controllers/auth-controller');

const router = express.Router();

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgetpassword)
router.post('/reset-password', authController.resetpassword)
router.post('/logout', authController.logout)

module.exports = router;
