const express = require('express');
const { check, validationResult } = require('express-validator');
const { register, login } = require('../controller/userController');
const loginLimiter = require('../middleware/loginLimiter');

const router = express.Router();

// Route d'inscription de l'utilisateur avec validation
router.post('/register', [
    check('email')
      .isEmail()
      .withMessage("Veuillez fournir un email valide."),
    check('username')
      .isLength({ min: 3, max: 20 })
      .withMessage("Le nom d'utilisateur doit comporter entre 3 et 20 caractères.")
      .isAlphanumeric()
      .withMessage("Le nom d'utilisateur ne doit contenir que des lettres et des chiffres."),
    check('password')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
      .withMessage("Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.")
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, register);

// Route de connexion de l'utilisateur
router.post('/login', loginLimiter, login);


module.exports = router;