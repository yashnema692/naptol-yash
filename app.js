const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
require("./Helpers/init_mongodb");
// require('./Helpers/init_db_data')
require("./Helpers/init_cron");
const cors = require("cors"); // Import CORS
const debug = require("debug")(process.env.DEBUG + "server");
const path = require("path");
const compression = require("compression");
const createError = require("http-errors");
const https = require("https");
const fs = require("fs");

const app = express();

const options = {
  key: fs.readFileSync("./certs/private-key.pem"),
  cert: fs.readFileSync("./certs/certificate.pem"),
};

const server = https.createServer(options, app);

if (process.env.ENV === "development") {
  app.use(morgan("dev"));
}

// Define CORS options
const corsOptions = {
  origin: '*', // Allow all origins (you can restrict this to specific domains)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Use CORS middleware with options
app.use(cors(corsOptions));

app.use(compression({ filter: shouldCompress }));

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    return false;
  }
  return compression.filter(req, res);
}

// Increase upload body size to 50 MB
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes Start ------
app.use("/api/auth", require("./routes/Auth.route"));
app.use("/api/user", require("./routes/user.route"));
app.use("/api/files", require("./routes/file.route"));
app.use("/api/farmer", require("./routes/farmer.route"));
app.use("/api/village", require("./routes/village.route"));
app.use("/api/hammals", require("./routes/hammals.route"));
app.use("/api/crop", require("./routes/crops.route"));
app.use("/api/parties", require("./routes/parties.route"));
app.use("/api/delivery", require("./routes/delivery.route"));
app.use("/api/taulparchi", require("./routes/taulparchi.route"));
app.use("/api/truckloading", require("./routes/truckLoading.route"));
app.use("/api/transaction", require("./routes/transaction.route"));
app.use("/api/truck", require("./routes/truck.route"));
app.use("/api/permission", require("./routes/permission.route"));
app.use("/api/advance", require("./routes/advancePayment.route"));


app.use("/api", (req, res, next) => {
  next(createError.NotFound());
});
// API Routes End --------

app.use(express.static(path.join(__dirname, "public", "dist", "browser")));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "dist", "browser", "index.html"));
});

app.use((err, req, res, next) => {
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = process.env.ENV === "development" ? err : {};

  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 3051;
server.listen(PORT, '0.0.0.0', () => {
  debug("Listening on " + PORT);
});
