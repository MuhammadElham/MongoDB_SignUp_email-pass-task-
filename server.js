// Express server chalaney k liye use hota hein
const express = require("express");
// Mongoose MongoDB k interaction k liye use hota hein
const mongoose = require("mongoose");
// BodyParser : body se data transfer krta hein Server k zarye
const bodyParser = require("body-parser");
// ThunderClient : testing for api
// Using env For safe the databse
require("dotenv").config();
const app = express();
const bcrypt = require("bcrypt");
const saltround = 10;
// const db = "mongodb://localhost:27017/";
const db = process.env.DB_URL;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err);
  });
// End Connections
const tuteSchema = new mongoose.Schema({
  fname: String,
  email: String,
  password: String,
});

const collection = mongoose.model("data", tuteSchema);

// SignUp
app.post("/signUp", async (req, res) => {
  try {
    const { email, password, fname } = req.body;
    if (!email || !password || !fname) {
      return res.send("Invalid Data");
    }

    // Check if email already exists
    const getdata = await collection.findOne({ email: email });

    if (getdata) {
      return res.send({
        status: 400,
        message: "Email already exists",
      });
    } else {
      // Generate salt and hash the password
      if (password.length > 4) {
        const salt = bcrypt.genSaltSync(saltround);
        const hash = bcrypt.hashSync(password, salt);

        // Create new user entry
        const data = new collection({
          fname: fname,
          email: email,
          password: hash,
        });

        // Save the data to the database
        await data.save();
        return res.send({
          status: 200,
          message: "Data saved successfully",
          data: data,
        });
      } else {
        return res.send({
          status: 400,
          message: "Small Password",
        });
      }
    }
  } catch (error) {
    res.send({
      message: "Something went wrong",
      data: error.message,
    });
  }
});
// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const getdata = await collection.findOne({
      email: email,
    });
    if (!getdata) {
      return res.send("Data not Found");
    }
    const match = bcrypt.compareSync(password, getdata.password);
    console.log(match);
    if (!match) return console.log("User not Found");
    res.send({
      message: "Login Successfully",
      data: getdata,
    });
  } catch (error) {
    res.send({
      message: "Wrong",
      data: error.message,
    });
  }
});
// Checking Server is Run or Not
app.listen(3000, () => {
  console.log("Server Running Successfully");
});
