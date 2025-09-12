const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from service B");
});

app.listen(3002, () => {
  console.log(`Server B is listening on http://localhost:3002`);
});
