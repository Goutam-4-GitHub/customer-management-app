const express = require("express");
const Database = require("better-sqlite3"); // ✅ use better-sqlite3
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const customerRoutes = require("./routes/customers");
const addressRoutes = require("./routes/addresses");

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const dbFile = path.join(__dirname, "db", "database.db");
const schemaFile = path.join(__dirname, "db", "schema.sql");

// Ensure DB file exists
const db = new Database(dbFile); // ✅ better-sqlite3 opens the DB directly
console.log("✅ Connected to SQLite DB");

// Run schema on startup
const schema = fs.readFileSync(schemaFile, "utf8");
try {
  db.exec(schema);
  console.log("✅ Database schema ensured");
} catch (err) {
  console.error("❌ Error running schema:", err.message);
}

// Attach DB to request object
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api", addressRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
