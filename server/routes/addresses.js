const express = require('express');
const router = express.Router();

// Add new address for a customer
router.post('/customers/:id/addresses', (req, res) => {
  const { address_details, city, state, pin_code } = req.body;
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `INSERT INTO addresses (customer_id, address_details, city, state, pin_code)
               VALUES (?, ?, ?, ?, ?)`;
  req.db.run(sql, [req.params.id, address_details, city, state, pin_code], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID, ...req.body, customer_id: req.params.id });
  });
});

// Get all addresses for a customer
router.get('/customers/:id/addresses', (req, res) => {
  const sql = `SELECT * FROM addresses WHERE customer_id = ?`;
  req.db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

// Update specific address
router.put('/addresses/:addressId', (req, res) => {
  const { address_details, city, state, pin_code } = req.body;
  const sql = `UPDATE addresses SET address_details=?, city=?, state=?, pin_code=? WHERE id=?`;
  req.db.run(sql, [address_details, city, state, pin_code, req.params.addressId], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Delete address
router.delete('/addresses/:addressId', (req, res) => {
  const sql = `DELETE FROM addresses WHERE id = ?`;
  req.db.run(sql, [req.params.addressId], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
