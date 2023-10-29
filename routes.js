// const express = require("express");
// const { client } = require("./index"); // Correct the path
// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const db = client.db("Reserveapp");
//     const collection = db.collection("trips_details");
//     const data = await collection.find({}).toArray();
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching data from MongoDB:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;

