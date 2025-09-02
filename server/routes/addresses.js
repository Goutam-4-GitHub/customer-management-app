const express = require("express");
const router = express.Router();

// Add new address for a customer
router.post("/customers/:id/addresses", (req, res) => {
  const { address_details, city, state, pin_code } = req.body;
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const stmt = req.db.prepare(
      "INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)"
    );
    const result = stmt.run(req.params.id, address_details, city, state, pin_code);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body, customer_id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all addresses for a customer
router.get("/customers/:id/addresses", (req, res) => {
  try {
    const rows = req.db.prepare("SELECT * FROM addresses WHERE customer_id = ?").all(req.params.id);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update specific address
router.put("/addresses/:addressId", (req, res) => {
  const { address_details, city, state, pin_code } = req.body;
  try {
    const result = req.db
      .prepare("UPDATE addresses SET address_details=?, city=?, state=?, pin_code=? WHERE id=?")
      .run(address_details, city, state, pin_code, req.params.addressId);

    res.json({ updated: result.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete address
router.delete("/addresses/:addressId", (req, res) => {
  try {
    const result = req.db.prepare("DELETE FROM addresses WHERE id = ?").run(req.params.addressId);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
