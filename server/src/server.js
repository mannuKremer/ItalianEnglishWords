require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const wordsRouter = require("./wordsController");
const favoritesRouter = require("./favoritesController");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/words", wordsRouter);
app.use("/favorites", favoritesRouter);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
