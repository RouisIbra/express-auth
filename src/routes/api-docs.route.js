const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const apiDocsRouter = express.Router();

const swaggerDocument = YAML.load(
  path.join(__dirname, "./../doc/openapi.yaml")
);

apiDocsRouter.use("/", swaggerUi.serve);
apiDocsRouter.get("/", swaggerUi.setup(swaggerDocument));

module.exports = apiDocsRouter;
