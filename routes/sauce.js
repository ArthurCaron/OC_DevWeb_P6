const express = require("express");
const router = express.Router();
const { body } = require('express-validator');
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");

const sauceCtrl = require("../controllers/sauce");

function getImageUrl(req) {
    return `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
}

const parse = (req, res, next) => {
    delete req._id;
    delete req._userId;
    if (req.file) {
        req.body = JSON.parse(req.body.sauce);
        req.imageUrl = getImageUrl(req)
    }
    next();
}

router.get("/", auth, sauceCtrl.getSauces);
router.get("/:id", auth, sauceCtrl.getSauce);
router.post(
    "/", 
    auth, 
    multer, 
    parse,
    body("name").trim().not().isEmpty().escape(),
    body("manufacturer").trim().not().isEmpty().escape(),
    body("description").trim().not().isEmpty().escape(),
    body("mainPepper").trim().not().isEmpty().escape(),
    sauceCtrl.addSauce
);

router.put(
    "/:id", 
    auth, 
    multer,
    parse,
    body("name").trim().not().isEmpty().escape(),
    body("manufacturer").trim().not().isEmpty().escape(),
    body("description").trim().not().isEmpty().escape(),
    body("mainPepper").trim().not().isEmpty().escape(),
    sauceCtrl.updateSauce
);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.updateLikeSauce);

module.exports = router;
