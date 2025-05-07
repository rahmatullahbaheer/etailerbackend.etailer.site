const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const pool = require("./app/config/db");

const app = express();

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({
  origin: "*",
  credentials: true
}));

// Fix: Use async/await properly in GET request
app.use("/api/v1/test",(req,res)=>{
    return res.send("Hello World");
})
// POST request for testing
app.post("/api/v1/test", (req, res) => {
  const { name } = req.body; // Assuming you're sending JSON with `name`
  
  if (!name) {
    return res.status(400).send({ message: "Name is required" });
  }
  
  // Respond back with only the received `name`
  return res.status(200).send({
    message: "Data received successfully",
    name: name
  });
});


app.use("/api/v1", require("./app/routes/usersRoutes"));
app.use("/api/v1", require("./app/routes/measurementsRoutes"));
app.use("/api/v1/design", require("./app/routes/designRoutes"));
app.use("/api/v1/orders", require("./app/routes/userOrdersRoutes"));
app.use("/api/v1/upload", require("./app/upload-images"));
app.use("/api/v1", require("./app/routes/customDesignRoute"));
const port = 5050;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
