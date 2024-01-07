const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    contactNumber: String,
    busName: String,
    busTiming: String,
    date: String,
    seatNumber: [Number],
    passengerDetails: [
      {
        name: String,
        age: Number,
        gender: String,
      },
    ],
    destination: String,
  },
  { collection: "order_details" }
);
const OrderDetails = mongoose.model("Orderdetails", orderSchema);

module.exports = OrderDetails;
