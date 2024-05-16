import dotenv from "dotenv"
import express from "express";
import connectDB from "./db/mongodb.js";
const app = express();

dotenv.config({
    path: "./.env"
});

 connectDB();