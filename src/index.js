import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import commentRoutes from './routes/comment.routes.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import authRoutes from './routes/auth.routes.js'; // IMPORT
import photoRoutes from './routes/photo.routes.js'; // IMPORT

const app = express();
app.use(express.json());

// Mount the routes with an /api prefix
app.use('/api/auth', authRoutes); // MOUNT

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/photos', photoRoutes); // Don't forget to import and mount

// error handler
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
