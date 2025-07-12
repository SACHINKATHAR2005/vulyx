import express from "express";
import { loginUser, logoutUser, RegisterUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middlware.js";
import { getUserApiKey, regenerateApiKey } from "../controllers/user.controller.js";
const router = express.Router();

router.post("/register", RegisterUser);
//  http://localhost:3000/auth/users/register
router.post("/login",loginUser);
//  http://localhost:3000/auth/users/login
router.post("/logout", logoutUser);
//  http://localhost:3000/auth/users/logout

router.get("/me/api-key", verifyToken, getUserApiKey);           //  View API key
// Endpoint: http://localhost:3000/auth/users/me/api-key
router.post("/me/api-key", verifyToken, regenerateApiKey);   // Regenerate API key
// Endpoint: http://localhost:3000/auth/users/me/api-key



export default router;