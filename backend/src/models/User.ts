import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export interface IUser extends mongoose.Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  generateAuthToken(): string;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    profilePicture: {
      type: String
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Method to generate a JWT for the user
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  return token;
};

export const User = mongoose.model<IUser>('User', userSchema); 