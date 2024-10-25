const bcrypt = require('bcrypt');
const {body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
    // Validation et assainissement des données
    const validationRules = [
        body('email')
            .isEmail()
            .withMessage('Doit être un email valide.')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 }) // Minimum de 8 caractères
            .withMessage('Le mot de passe doit contenir au moins 8 caractères.')
            .matches(/\d/)
            .withMessage('Le mot de passe doit contenir au moins un chiffre.')
            .matches(/[A-Z]/)
            .withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('Le mot de passe doit contenir au moins un caractère spécial.')
    ];
    Promise.all(validationRules.map(validation => validation.run(req)))
        .then(() => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Hash du mot de passe et création de l'utilisateur
            bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    const user = new User({
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                        .catch(error => res.status(400).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if (user === null){
            res.status(401).json({message : 'Les identifiants sont incorrecte'})
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    res.status(401).json({message : 'Les identifiants sont incorrecte'})
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        )
                    })
                }
            })
            .catch(error => res.status(500).json({error}));
        }
    })
    .catch(error => res.status(500).json({error}));
};