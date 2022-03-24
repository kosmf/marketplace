require("dotenv").config();
require("module-alias/register");

const express = require("express");
const app = express();
require("morgan-body")(app);
const routes = require("./routes");
const { SERVICE_NAME = "Express JS", SERVICE_PORT = "8080" } = process.env;

app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));
app.use((error, req, res, next) => {
  return error instanceof SyntaxError ? res.status(500).send({ message: "Invalid request data structure" }) : next();
});

app.use(routes);

app.listen(SERVICE_PORT, () => {
  console.log(`${SERVICE_NAME} running on port ${SERVICE_PORT}`);
});
