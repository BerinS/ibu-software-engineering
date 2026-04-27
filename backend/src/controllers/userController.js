import * as User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

// POST /api/users/register
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { full_name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      full_name,
      email,
      password_hash,
      role
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// authenticate user and get token (Login) POST /api/users/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        // JWT later
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// GET all users (Admin only) GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/profile/:id
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};