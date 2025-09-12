const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from service A");
});

app.listen(3001, () => {
  console.log(`Server A is listening on http://localhost:3001`);
});
