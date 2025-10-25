// src/controllers/auth.controller.js
import * as userService from '../services/user.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from 'express-async-handler';

export const registerUser = asyncHandler(async (req, res) => {
    // The service now handles password hashing
    const newUser = await userService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, newUser, "User registered successfully"));
});

// We will add a loginUser function here in the next lab

export const loginUser = asyncHandler(async (req, res) => {
    const token = await userService.loginUser(req.body);
    res.status(200).json(new ApiResponse(200, { token }, "User logged in successfully"));
});