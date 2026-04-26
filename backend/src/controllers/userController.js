import * as User from '../models/userModel.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    next(error); // pass error to middleware
  }
};