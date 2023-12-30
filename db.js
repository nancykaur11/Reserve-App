// 
// db.js
const mongoose = require("mongoose");

const uri = "mongodb+srv://nancykaur:komalapp@cluster0.fgbj8ui.mongodb.net/Reserveapp";

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

module.exports = { connectToMongoDB, mongoose };
