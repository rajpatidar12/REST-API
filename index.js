const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");
const app = express();
const PORT = 8000;

// Middleware
app.use(express.urlencoded({ extended: false })); // For x-www-form-urlencoded
app.use(express.json()); // For application/json

// Routes
app.get("/users", (req, res) => {
  const html = `
  <ul>
  ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
  </ul>
  `;
  res.send(html);
});

app.get("/api/users", (req, res) => {
  return res.json(users);
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = { ...users[userIndex], ...req.body }; // Merge updates
    users[userIndex] = updatedUser;

    // Save changes to MOCK_DATA.json
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update user" });
      }
      res.json({ status: "success", updatedUser });
    });
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove user from array
    users.splice(userIndex, 1);

    // Save changes to MOCK_DATA.json
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete user" });
      }
      res.json({ status: "success", id });
    });
  });

app.post("/api/users", (req, res) => {
  const body = req.body;
  users.push({ ...body, id: users.length + 1 });

  // Save new user to MOCK_DATA.json
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to add user" });
    }
    res.json({ status: "success", id: users.length });
  });
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
