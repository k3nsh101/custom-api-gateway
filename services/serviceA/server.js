const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from service A");
});

app.get("/todos/:id", async (req, res) => {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos/1",
    );
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.log("Error fetching todo by id", error);
    res.sendStatus(500);
  }
});

app.listen(3001, () => {
  console.log(`Server A is listening on http://localhost:3001`);
});
