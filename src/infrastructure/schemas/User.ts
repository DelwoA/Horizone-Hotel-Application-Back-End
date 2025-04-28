import mongoose from "mongoose";

/**
 * Mongoose schema for User documents
 * Defines the structure and validation rules for user data in MongoDB
 * Currently stores basic user information (name and email)
 * Note: Authentication is handled by Clerk, so this schema is minimal
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

/**
 * Mongoose model for User collection
 * Provides methods for interacting with user documents in the database
 */
const User = mongoose.model("User", UserSchema);
export default User;
