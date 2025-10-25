// src/routes/photo.routes.js
import { Router } from 'express';
import * as photoController from '../controllers/photo.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

// A user must be logged in for all photo routes
router.use(authMiddleware);

router.get('/', photoController.getUserPhotos);
router.delete('/:id', photoController.deleteUserPhoto);

// The 'upload' middleware processes the file upload with the field name 'photo'
router.post('/upload', upload.single('photo'), photoController.uploadPhoto);

export default router;