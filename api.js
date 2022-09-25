if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Importing modules
const express = require("express");
const app = express();
const serverless = require("serverless-http");

// Defining variables
let lock_state = "close";
let lock_id = null;
const api_username = process.env.LOCK_API_USERNAME;
const api_password = process.env.LOCK_API_PASSWORD;
const port_number = process.env.PORT ?? 8081;

// helper functions
const check_credentials = (username, password) => {
  if (username === api_username && password === api_password) return 1;
  return 0;
};

const success_message = () => {
  const response = { message: "success", lock_state };
  return response;
};

const error_message = () => {
  const response = {
    message: "failed",
    err: { message: "Invalid credentials" },
  };

  return response;
};

const send_response = (state, username, password, res) => {
  if (check_credentials(username, password)) {
    lock_state = state;
    return res.send(success_message());
  }
  lock_id = null;
  return res.send(error_message());
};

// Server start
app.listen(port_number, () =>
  console.log(`Print server running at port ${port_number}`)
);

// Routing and urls
// GET requests
// URL to get state of the locker
app.get("/api/lock_state", (_, res) => {
  if (lock_id !== null && lock_state !== "lock") {
    return res.send({
      lock_state,
      lock_id,
    });
  }
  return res.send({ lock_state });
});

// POST requests
// URL to open the locker with a id
app.post("/api/open/:id/:username/:password", (req, res) => {
  const { username, password, id } = req.params;
  lock_id = id;
  return send_response("open", username, password, res);
});

// URL to lock the locker
app.post("/api/lock/:username/:password", (req, res) => {
  const { username, password } = req.params;
  lock_id = null;
  return send_response("close", username, password, res);
});
