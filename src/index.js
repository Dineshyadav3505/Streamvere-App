import dotenv from "dotenv"
import express from "express";
import connectDB from "./db/mongodb.js";
const app = express();

dotenv.config({
    path: "./.env"
});

connectDB()
.then (()=>{

    app.on("error", (error)  =>{
        console.log(error);
        throw error;
    });

    app.listen(process.env.PORT, ()=>{
        console.log(`Server is runing at PORT : ${process.env.PORT}`);
    } );
})
.catch((error)=>{
    console.log("MONGODB Connection failed :",error);
})
