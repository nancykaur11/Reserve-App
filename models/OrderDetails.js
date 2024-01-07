const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
    {
        contactNumber: String,
        busName: String,
        busTiming: [String],
        date: String,
        seatNumber: [String],
        passengerDetails: [
          {
            name: String,
            age: String,
            gender: String,
          },
        ],
        travel: [String],
        cost: Number,
      },
      { collection: "order_details" }
    );
    
const OrderDetails = mongoose.model("Orderdetails", orderSchema);

module.exports = OrderDetails;
