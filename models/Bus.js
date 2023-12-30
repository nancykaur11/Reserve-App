// models/Bus.js
const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  date: String,
  from: String,
  to: String,
  busOwnerID: Number,
  startTime: String,
  EndTime: String,
  category: String,
  SeatBooked: [String],
  bus_no: String,
  animeties_list: [String],
  busFare: Number,
  busName: String,
}, { collection: "trips_details" }); 
const Bus = mongoose.model("Bus", busSchema);

module.exports = Bus;
