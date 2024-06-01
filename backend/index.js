import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes/route.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/", routes);

const connectionString = process.env.DB_STR;
mongoose.connect(connectionString);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});