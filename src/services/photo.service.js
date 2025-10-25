// src/services/photo.service.js
import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import fs from 'fs/promises'; // Import Node.js file system module

export const createPhoto = async (photoData) => {
    const { caption, filePath, userId } = photoData;
    const [result] = await pool.query(
        'INSERT INTO photos (caption, filePath, userId) VALUES (?, ?, ?)',
        [caption, filePath, userId]
    );
    const [rows] = await pool.query('SELECT * FROM photos WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getPhotosByUserId = async (userId) => {
    const [photos] = await pool.query('SELECT * FROM photos WHERE userId = ?', [userId]);
    return photos;
};

export const deletePhoto = async (photoId, userId) => {
    // 1. Get photo to check ownership and get file path
    const [rows] = await pool.query('SELECT * FROM photos WHERE id = ?', [photoId]);
    if (rows.length === 0) {
        throw new ApiError(404, "Photo not found");
    }
    const photo = rows[0];

    // 2. Authorization check
    if (photo.userId !== userId) {
        throw new ApiError(403, "Forbidden: You do not have permission to delete this photo.");
    }

    // 3. Delete the physical file from the server
    try {
        await fs.unlink(photo.filePath);
    } catch (error) {
        console.error("Failed to delete file from filesystem:", error);
        // We can choose to continue and still delete the DB record,
        // or throw an error. For now, we'll log it and continue.
    }

    // 4. Delete the record from the database
    await pool.query('DELETE FROM photos WHERE id = ?', [photoId]);
    return;
};