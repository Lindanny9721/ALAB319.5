import express from "express";
import mongoose, { mongo } from "mongoose";
import dataBase from "./db/conn.mjs"
const PORT = 5050;
const app = express();

import grades from "./routes/grades.mjs";
import grades_agg from "./routes/grades_agg.mjs";

app.use(express.json());
dataBase();
app.get("/", (req, res) => {
  res.send("Welcome to the API.");
});
console.log(mongoose.connection.readyState);
app.use("/grades", grades);
app.use("/grades_agg", grades_agg);
app.get("/test", async (req, res) => {
  try {
    const connected = mongoose.connection.readyState === 1;
    res.status(200).send({message: `MongoDB is ${connected ? `connected` : `not connected`}` })
  }
  catch (error) 
  {
    res.status(500).send({error: "Can't check with mongoDB"});
  }
})

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Seems like we messed up somewhere...");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});