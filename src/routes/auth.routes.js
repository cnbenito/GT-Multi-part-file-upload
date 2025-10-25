// src/routes/auth.routes.js
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateRegistration, validateLogin } from '../middlewares/validator.middleware.js';

const router = Router();

// Define the registration endpoint
router.post('/register', validateRegistration, authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);

export default router;