import express from "express";
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

app.use("/grades", grades);
app.use("/grades_agg", grades_agg);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Seems like we messed up somewhere...");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});