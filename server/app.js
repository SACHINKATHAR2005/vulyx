import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors"; // <== ✅ ADD THIS
import cookieParser from "cookie-parser";

import { connectDB } from "./db/db.js";
import userRouter from "./routers/user.router.js";
import scanapi from "./routers/scan.routes.js";
import folderRoutes from "./routers/folder.routes.js";
import ciRoute from "./routers/ci.routes.js";
import reportRoute from "./routers/report.route.js";

const app = express();

// ✅ CORS Middleware with proper configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins for now
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Set-Cookie', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Enable pre-flight requests for all routes
// app.options('*', cors());

// ✅ Route Mounting
app.use("/auth/users", userRouter); // User routes
app.use("/scan", scanapi);
app.use("/folder", folderRoutes);
app.use("/ci", ciRoute);
app.use(reportRoute);



// ✅ Start server after DB connects
connectDB().then(() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
}).catch((error) => console.error("Error connecting to MongoDB:", error));
