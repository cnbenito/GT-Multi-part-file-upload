import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import bcrypt from 'bcrypt'; // IMPORT BCRYPT
import jwt from 'jsonwebtoken'; // IMPORT JWT

export const loginUser = async (loginData) => {
    const { email, password } = loginData;

    // 1. Find the user by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
        throw new ApiError(401, "Invalid credentials"); // Use a generic error
    }
    const user = rows[0];

    // 2. Compare the provided password with the stored hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid credentials"); // Same generic error
    }

    // 3. If password matches, generate a JWT
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token will expire in 1 hour
    });

    return token;
};

export const registerUser = async (userData) => {
    const { username, email, password } = userData; // Destructure password
    try {
        // HASH THE PASSWORD
        const saltRounds = 10; // The cost factor for hashing
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await pool.query(
            // Use the new password column
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            // Store the HASHED password, not the original
            [username, email, hashedPassword]
        );

        // Fetch the user, but OMIT the password from the return data
        const newUser = await getUserById(result.insertId);
        return newUser;

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new ApiError(409, "Username or email already exists.");
        }
        throw error;
    }
};

export const createUser = async ({ username, email }) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO users (username, email) VALUES (?, ?)`,
      [username, email]
    );
    return await getUserById(result.insertId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'Username or email already exists');
    }
    throw err;
  }
};

export const getUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, username, email, createdAt FROM users WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) throw new ApiError(404, 'User not found');
  return rows[0];
};

export const getAllUsers = async () => {
  const [rows] = await pool.query(
    `SELECT id, username, email, createdAt FROM users`
  );
  return rows;
};


export const updateUser = async (id, { username, email }) => {
  try {
    const [result] = await pool.query(
      `UPDATE users SET username = ?, email = ? WHERE id = ?`,
      [username, email, id]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "User not found");
    }

    return await getUserById(id);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Username or email already exists");
    }
    throw err;
  }
};

export const deleteUser = async (id) => {
  const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);

  if (result.affectedRows === 0) {
    throw new ApiError(404, "User not found");
  }

  return { message: "User deleted successfully" };
};
