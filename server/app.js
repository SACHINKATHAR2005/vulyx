import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./db/db.js";
import userRouter from "./routers/user.router.js";
import cookieParser from "cookie-parser";
import scanapi from "./routers/scan.routes.js";
import folderRoutes from "./routers/folder.routes.js"
import ciRoute from "./routers/ci.routes.js"


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth/users", userRouter); // Use the user router for user-related routes
app.use("/scan",scanapi)
app.use("/folder", folderRoutes); // Use the folder router for folder-related routes
app.use("/ci",ciRoute);

connectDB().then(()=>{
  console.log("Connected to MongoDB");
}).catch((error)=> console.error("Error connecting to MongoDB:", error));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});


app.listen(process.env.PORT || 3000,()=>{
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
})