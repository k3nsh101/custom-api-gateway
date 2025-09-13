const express = require("express");

const app = express();

app.get("/", (req, res) => {
  console.log(req.headers);
  res.send("Hello from service A");
});

app.get("/:id", (req, res) => {
  console.log(req.headers);
  console.log(req.path);
  res.send("Hello from service A");
});

app.listen(3001, () => {
  console.log(`Server A is listening on http://localhost:3001`);
});
