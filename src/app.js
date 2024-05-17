import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();


                 // Middlewares configuration //
////////////////////////////////////////////////////////////////
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true})); 

app.use(express.json({limit: "30kb"}))

app.use(express.urlencoded({ extended: true, limit: "30kb"}));

app.use(express.static("Public"));

app.use(cookieParser());


export {app}; 