const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const customerRoutes = require('./routes/customers');
const addressRoutes = require('./routes/addresses');

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const dbFile = path.join(__dirname, 'db', 'database.db');
const schemaFile = path.join(__dirname, 'db', 'schema.sql');

// Ensure DB file exists
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error(' Error connecting to SQLite DB:', err.message);
  else console.log(' Connected to SQLite DB');
});

// Run schema on startup
const schema = fs.readFileSync(schemaFile, 'utf8');
db.exec(schema, (err) => {
  if (err) console.error(' Error running schema:', err.message);
  else console.log(' Database schema ensured');
});

// Attach DB to request object
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api', addressRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
