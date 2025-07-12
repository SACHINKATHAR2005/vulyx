import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  avatar: {
    type: String,
    default: ""
  },

  credits: {
    type: Number,
    default: 0
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  apiKey: {
  type: String,
  default: "", 
},
scanCount: {
  type: Number,
  default: 0,
},

  createdAt: {
    type: Date,
    default: Date.now
  }
},{
    timestamps: true
});


export const User = mongoose.model("User", userSchema);
