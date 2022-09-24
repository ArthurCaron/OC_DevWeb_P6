const fs = require("fs");
const { validationResult } = require('express-validator');
const Sauce = require("../models/Sauce");

function getImageUrl(req) {
    return `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
}

exports.getSauces = (req, res) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.addSauce = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }

    if (req.file === undefined) {
        res.status(400).json({ message: "An image is required to create a sauce" });
    } else {
        const sauce = new Sauce({
            userId: req.auth.userId,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            imageUrl: req.imageUrl,
            heat: req.body.heat,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: [],
        });
    
        sauce.save()
            .then(() => res.status(201).json({ message: "Sauce created" }))
            .catch(error => res.status(400).json({ error }));
    }
};

function deleteImage(imageUrl, callback) {
    const filename = imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
        callback();
    });
}

exports.updateSauce = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "Not authorized to modify sauce created by another user" });
            } else {
                const saveSauce = () => {
                    Sauce
                        .updateOne(
                            { _id: req.params.id },
                            {
                                name: req.body.name,
                                manufacturer: req.body.manufacturer,
                                description: req.body.description,
                                mainPepper: req.body.mainPepper,
                                imageUrl: req.imageUrl,
                                heat: req.body.heat,
                            }
                        )
                        .then(() => res.status(200).json({ message: "Sauce updated" }))
                        .catch(error => res.status(400).json({ error }));
                }

                if (req.imageUrl !== undefined) {
                    deleteImage(sauce.imageUrl, saveSauce);
                } else {
                    saveSauce();
                }
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "Not authorized to delete sauce created by another user" });
            } else {
                deleteImage(sauce.imageUrl, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Sauce deleted" }))
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => res.status(400).json({ error }));
};

function removeItem(arr, value) {
    return arr.filter(it => it !== value);
}

function removeFromDislikes(sauce, userId) {
    const usersDisliked = removeItem(sauce.usersDisliked, userId);
    if (usersDisliked.length < sauce.usersDisliked.length) {
        sauce.usersDisliked = usersDisliked;
        sauce.dislikes--;
    }
}

function removeFromLikes(sauce, userId) {
    const usersLiked = removeItem(sauce.usersLiked, userId);
    if (usersLiked.length < sauce.usersLiked.length) {
        sauce.usersLiked = usersLiked;
        sauce.likes--;
    }
}

function addToDislikes(sauce, userId) {
    sauce.usersDisliked.push(userId);
    sauce.dislikes++;
}

function addToLikes(sauce, userId) {
    sauce.usersLiked.push(userId);
    sauce.likes++;
}

exports.updateLikeSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const userId = req.auth.userId;
            const save = true;

            removeFromLikes(sauce, userId);
            removeFromDislikes(sauce, userId);

            if (req.body.like == 1) {
                addToLikes(sauce, userId);
            } else if (req.body.like == 0) {
                // Do nothing
            } else if (req.body.like == -1) {
                addToDislikes(sauce, userId);
            } else {
                save = false;
                res.status(400).json({ message: "Value for like is invalid" });
            }

            if (save) {
                Sauce
                    .updateOne(
                        { _id: req.params.id },
                        {
                            likes: sauce.likes,
                            dislikes: sauce.dislikes,
                            usersLiked: sauce.usersLiked,
                            usersDisliked: sauce.usersDisliked
                        }
                    )
                    .then(() => res.status(200).json({ message: "Sauce updated" }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};
