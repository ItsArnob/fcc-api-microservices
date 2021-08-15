const { Router } = require("express");
const { isURL } = require("validator");
const shortUrl = require("../models/shortUrl.js");
const dns = require("dns");
const router = Router();

router.post("/shorturl", (req, res) => {
    let retryCount = 0;
    if (!req.body?.url) return res.json({ error: "No url provided" });
    let originalUrl = req.body.url.trim();
    if (!isURL(originalUrl, { protocols: ["http", "https"], require_protocol: true })) return res.json({ error: "Invalid url" });

    originalUrl = new URL(originalUrl);
    dns.lookup(originalUrl.hostname, (err) => {
        if (err) return res.json({ error: "Invalid hostname" });

        shortUrl
            .findOne({ original_url: originalUrl.href })
            .exec()
            .then((doc) => {
                if (doc) return res.json({ original_url: doc.original_url, short_url: doc._id });
                const saveData = () => {
                    const createShortUrl = new shortUrl({
                        original_url: originalUrl.href
                    });
                    createShortUrl.save((err, newDoc) => {
                        if (err) { 
                            if (err.code == 11000) {
                                // retry thrice before giving up
                                if (retryCount < 3) {
                                    saveData();
                                    retryCount++;
                                    console.log("ID creation collision occurred.");
                                } else {
                                    res.status(500).json({
                                        error: "Short url ID creation collision occurred."
                                    });
                                    console.error("ID creation collision occurred. Try upping the nanoid ID length.");
                                }
                            } else {
                                res.status(500).json({
                                    error: "Something went wrong while saving data."
                                });
                                console.error(err);
                            }
                        } else {
                            console.log("New url shortened", newDoc);
                            res.json({
                                original_url: newDoc.original_url,
                                short_url: newDoc._id
                            });
                        }
                    });
                };
                saveData();
            })
            .catch((e) => {
                res.status(500).json({
                    error: "Something went wrong while fetching data.",
                });
                console.error(e);
            });
    });
});

const shortIdHandler = (req, res, get) => {
    shortUrl.findById(req.params.shortid, "original_url")
        .exec()
        .then((doc) => {
            if(!doc) return res.status(404).json({ error: "No short URL found" });
            if(get) return res.json(doc);
            res.redirect(doc.original_url);
        })
        .catch((e) => {
            res.status(500).json({
                error: "Something went wrong while fetching data.",
            });
            console.error(e);
        });
    
}
router.get("/shorturl/:shortid", (req, res) => shortIdHandler(req, res, false));
router.get("/geturl/:shortid", (req, res) => shortIdHandler(req, res, true));

router.all("*", (req, res) => {
    res.json({ error: "The API route you are looking for does not exist." });
});
module.exports = router;
