import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get('/', (req, res) => {
  res.send("Hello");
});

app.listen(process.env.PORT,()=>{
  console.log("Server is running on port 5000");
})