const express = require("express");
const mongoose = require("mongoose");

mongoose.connect(
    "mongodb+srv://Hefty5430:b2b3i495rwMC5d3PTzK2DDaVdVFmmL@cluster0.ztmlhtm.mongodb.net/?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connexion to MongoDB Atlas => success"))
    .catch(() => console.log("Connexion to MongoDB Atlas => failure"));

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

app.use(express.json());

module.exports = app;