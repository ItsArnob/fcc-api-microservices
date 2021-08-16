require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRouter = require("./router/apiRouter.js");
const { connect } = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    family: 4,
};

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/views/index.html`);
});
app.all("*", (req, res) => {
    res.status(404).send("The route you are looking for does not exist.");
});

console.log("Initializing...");
connect(process.env.MONGODB_URI, mongoOptions)
    .then(() => {
        console.log("Connected to mongoDB!");
        app.listen(port, () => {
            console.log(`Exercise tracker microservice listening on port: ${port}`);
        });
    })
    .catch((e) => {
        console.error("Failed to connect to mongoDB.");
        console.error(e);
    });
