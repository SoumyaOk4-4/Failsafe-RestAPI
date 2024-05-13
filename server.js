//importing packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;

//middlewares
app.use(cors());
app.use(express.json());

//user schema
const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
}, {
    timestamps: true
});

//db model
const userModel = mongoose.model("user", userSchema);

// CRUD
app.get("/", async (req, res) => {
    try {
        const userData = await userModel.find({});
        res.json({ message: "Fetched", success: true, data: userData });
    } catch (err) {
        console.log(err);
    }
});

app.post("/create", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        //check if email exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ message: "Email already exists", success: false });
        } else {
            //password hashing
            const hashedPassword = await bcryptjs.hash(password, 10);
            const userData = await userModel.create({ name, email, password: hashedPassword });
            res.json({ message: "Created", success: true, data: userData });
        }
    } catch (err) {
        console.log(err);
    }
});

app.put("/update", async (req, res) => {
    try {
        const { _id, password, ...rest } = req.body;
        if (password) {//if a password is provided in the request
            //password hashing
            const hashedPassword = await bcryptjs.hash(password, 10);
            const userData = await userModel.updateOne({ _id: _id }, { password: hashedPassword, ...rest });
            res.json({ message: "Update", success: true, data: userData });
        } else { // others update
            const userData = await userModel.updateOne({ _id: _id }, ...rest);
            res.json({ message: "Update", success: true, data: userData });
        }
    } catch (err) {
        console.log(err);
    }

});

app.delete("/delete/:id", async (req, res) => {
    try {
        const _id = req.params.id;
        const userData = await userModel.deleteOne({ _id: _id });
        res.json({ message: "Deleted", success: true, data: userData });
    } catch (err) {
        console.log(err);
    }
});

//db setup
mongoose.connect(mongoUrl).then(() => {
    try {
        console.log('db connected');
        app.listen(port, () => {
            console.log("running...");
        });
    } catch (err) {
        console.log(err);
    }
}).catch((err) => {
    console.log(err);
});
