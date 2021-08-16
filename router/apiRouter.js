const { Router } = require("express");
const Users = require("../models/users.js");
const Exercises = require("../models/exercises.js");
const { isValidObjectId } = require("mongoose");
const router = Router();

router.post("/users", (req, res) => {
    let username = req.body?.username;
    const user = new Users({ username: username });

    user.save()
        .then((userDoc) => {
            res.json({ _id: userDoc._id, username: userDoc.username });
        })
        .catch((err) => {
            if (err.name == "ValidationError") {
                const error = {};
                for ([key, value] of Object.entries(err.errors)) {
                    error[key] = value.message;
                }
                res.status(400).json({ error: error });
            } else if (err.code == 11000) {
                res.json({ error: "username is taken." });
            } else {
                res.status(500).json({
                    error: "Something went wrong while trying to save data.",
                });
                console.error(err);
            }
        });
});
router.post("/users/:uid/exercises", (req, res) => {
    let uid = req.params.uid;
    if (!isValidObjectId(uid)) return res.json({ error: "Invalid user ID." });
    Users.findById(uid)
        .exec()
        .then((user) => {
            if (!user) return res.json({ error: "User not found." });
            const exercise = new Exercises({
                userID: uid,
                description: req.body?.description,
                duration: req.body?.duration,
                date: req.body?.date ? req.body.date : undefined,
            });
            exercise
                .save()
                .then((exerciseDoc) => {
                    const { date, duration, description } =
                        exerciseDoc.toObject();
                    res.json({
                        user._id,
                        username: user.username,
                        date: new Date(date).toDateString(),
                        duration,
                        description,
                    });
                })
                .catch((err) => {
                    if (err.name == "ValidationError") {
                        const error = {};
                        for ([key, value] of Object.entries(err.errors)) {
                            error[key] = value.message;
                        }
                        res.status(400).json({ error: error });
                    } else {
                        res.status(500).json({
                            error: "Something went wrong while trying to save data.",
                        });
                        console.error(err);
                    }
                });
        })
        .catch((err) => {
            res.status(500).json({
                error: "Something went wrong while trying to fetch data.",
            });
            console.error(err);
        });
});
router.get("/users/:uid/logs", (req, res) => {
    const uid = req.params.uid;
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);
    const limit = req.query.limit;
    if (!isValidObjectId(uid)) return res.json({ error: "Invalid user ID." });
    Users.findById(uid)
        .exec()
        .then((user) => {
            if (!user) return res.json({ error: "User not found." });

            Exercises.find({
                userID: req.params.uid,
                date: {
                    $lte: to != "Invalid Date" ? to.toISOString() : Date.now(),
                    $gte: from != "Invalid Date" ? from.toISOString() : 0,
                },
            })
                .select({ _id: 0, date: 1, duration: 1, description: 1 })
                .limit(parseInt(limit))
                .sort("date")
                .exec()
                .then((exercises) => {
                    let logs = [];
                    exercises.forEach((exercise) => {
                        logs.push({
                            ...exercise.toObject(),
                            date: new Date(exercise.date).toDateString(),
                        });
                    });
                    res.json({
                        _id: user._id,
                        username: user.username,
                        count: exercises.length,
                        log: logs,
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        error: "Something went wrong while trying to fetch data.",
                    });
                    console.error(err);
                });
        })
        .catch((err) => {
            res.status(500).json({
                error: "Something went wrong while trying to fetch data.",
            });
            console.error(err);
        });
});
router.get("/users", (req, res) => {
    Users.find({})
        .select({ username: 1, _id: 1 })
        .exec()
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            res.status(500).json({
                error: "Something went wrong while trying to fetch data.",
            });
            console.error(err);
        });
});
router.all("*", (req, res) => {
    res.status(404).json({
        error: "The API route you are looking for does not exist.",
    });
});

module.exports = router;
