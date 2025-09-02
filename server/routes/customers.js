const express = require("express");
const router = express.Router();

// Create new customer (with optional address)
router.post("/", (req, res) => {
  const { first_name, last_name, phone_number, address_details, city, state, pin_code } = req.body;

  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: "First name, last name, and phone number are required" });
  }

  try {
    // Insert customer
    const stmt = req.db.prepare(
      "INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)"
    );
    const result = stmt.run(first_name, last_name, phone_number);
    const customerId = result.lastInsertRowid;

    // If address is provided
    if (address_details && city && state && pin_code) {
      const addressStmt = req.db.prepare(
        "INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)"
      );
      const addressResult = addressStmt.run(customerId, address_details, city, state, pin_code);

      return res.status(201).json({
        id: customerId,
        first_name,
        last_name,
        phone_number,
        address: {
          id: addressResult.lastInsertRowid,
          address_details,
          city,
          state,
          pin_code,
        },
      });
    }

    // If no address
    res.status(201).json({ id: customerId, first_name, last_name, phone_number });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Phone number already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Get all customers (with search, filter, pagination)
router.get("/", (req, res) => {
  let { page = 1, limit = 5, search, city, state, pin, sort = "id", order = "ASC" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let params = [];

  if (search) {
    whereClauses.push("(first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (city) {
    whereClauses.push("id IN (SELECT customer_id FROM addresses WHERE city LIKE ?)");
    params.push(`%${city}%`);
  }
  if (state) {
    whereClauses.push("id IN (SELECT customer_id FROM addresses WHERE state LIKE ?)");
    params.push(`%${state}%`);
  }
  if (pin) {
    whereClauses.push("id IN (SELECT customer_id FROM addresses WHERE pin_code LIKE ?)");
    params.push(`%${pin}%`);
  }

  const whereSQL = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";
  const sql = `SELECT * FROM customers ${whereSQL} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) as count FROM customers ${whereSQL}`;

  try {
    const rows = req.db.prepare(sql).all(...params, limit, offset);
    const countResult = req.db.prepare(countSql).get(...params);

    res.json({
      data: rows,
      total: countResult.count,
      page,
      totalPages: Math.ceil(countResult.count / limit),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single customer
router.get("/:id", (req, res) => {
  try {
    const row = req.db.prepare("SELECT * FROM customers WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Customer not found" });
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update customer
router.put("/:id", (req, res) => {
  const { first_name, last_name, phone_number } = req.body;
  try {
    const result = req.db
      .prepare("UPDATE customers SET first_name=?, last_name=?, phone_number=? WHERE id=?")
      .run(first_name, last_name, phone_number, req.params.id);

    res.json({ updated: result.changes });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Phone number already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Delete customer
router.delete("/:id", (req, res) => {
  try {
    const result = req.db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
