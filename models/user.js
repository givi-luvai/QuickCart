import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  _Id: { type: String, required: true, },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  imageUrl : { type: String, required: true },
  cartItems: {type:Object, default: {}}
},{minimize: false});
  
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;