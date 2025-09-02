const express = require('express');
const router = express.Router();

// Create new customer (with optional address)
router.post('/', (req, res) => {
  const { first_name, last_name, phone_number, address_details, city, state, pin_code } = req.body;

  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: 'First name, last name, and phone number are required' });
  }

  const sql = `INSERT INTO customers (first_name, last_name, phone_number)
               VALUES (?, ?, ?)`;

  req.db.run(sql, [first_name, last_name, phone_number], function (err) {
    if (err) {
      console.error(err.message);
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
      return res.status(400).json({ error: err.message });
    }

    const customerId = this.lastID;

    // If address is provided, insert into addresses table
    if (address_details && city && state && pin_code) {
      const addressSql = `INSERT INTO addresses (customer_id, address_details, city, state, pin_code)
                          VALUES (?, ?, ?, ?, ?)`;

      req.db.run(addressSql, [customerId, address_details, city, state, pin_code], function (err2) {
        if (err2) {
          console.error(err2.message);
          return res.status(400).json({ error: err2.message });
        }

        res.status(201).json({
          id: customerId,
          first_name,
          last_name,
          phone_number,
          address: {
            id: this.lastID,
            address_details,
            city,
            state,
            pin_code
          }
        });
      });
    } else {
      // No address provided
      res.status(201).json({
        id: customerId,
        first_name,
        last_name,
        phone_number
      });
    }
  });
});

// Get all customers (with search, filter, pagination)
router.get('/', (req, res) => {
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

  req.db.all(sql, [...params, limit, offset], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });

    req.db.get(countSql, params, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });

      res.json({
        data: rows,
        total: result.count,
        page,
        totalPages: Math.ceil(result.count / limit),
      });
    });
  });
});

// Get single customer
router.get('/:id', (req, res) => {
  const sql = `SELECT * FROM customers WHERE id = ?`;
  req.db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Customer not found' });
    res.json(row);
  });
});

// Update customer
router.put('/:id', (req, res) => {
  const { first_name, last_name, phone_number } = req.body;
  const sql = `UPDATE customers SET first_name=?, last_name=?, phone_number=? WHERE id=?`;
  req.db.run(sql, [first_name, last_name, phone_number, req.params.id], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
      return res.status(400).json({ error: err.message });
    }
    res.json({ updated: this.changes });
  });
});

// Delete customer
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM customers WHERE id = ?`;
  req.db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
