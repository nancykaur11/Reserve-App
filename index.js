const express = require("express");
const { connectToMongoDB } = require("./db");
const apiRoutes = require("./apiRoutes");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/", apiRoutes);

async function startServer() {
  try {
    await connectToMongoDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}
startServer();

