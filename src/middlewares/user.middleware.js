import { body, validationResult } from 'express-validator';

export const validateCreateUser = [
    body('name')
        .exists({ checkNull: true })
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long')
        .isLength({ max: 50 })
        .withMessage('Name must be at most 50 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];



