const express = require('express');
const { forgotPassword, resetPassword } = require('../controller/passwordController');
const router = express.Router();

// route pour la demande de réinitialisation de mot de passe
router.post('/forgot-password', forgotPassword);

// route pour la réinitialisation de mot de passe
router.post('/reset-password', resetPassword);

module.exports = router;