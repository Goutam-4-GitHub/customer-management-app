import React, { useState, useEffect } from "react";

function CustomerForm({ onSubmit, initialData }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address_details: "",
    city: "",
    state: "",
    pin_code: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        phone_number: initialData.phone_number || "",
        address_details: initialData.address_details || "",
        city: initialData.city || "",
        state: initialData.state || "",
        pin_code: initialData.pin_code || ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.first_name.trim() || !form.last_name.trim() || !form.phone_number.trim()) {
      alert("First name, last name, and phone number are required!");
      return;
    }

    if (!/^\d{10,}$/.test(form.phone_number)) {
      alert("Phone number must be at least 10 digits and numeric only");
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>First Name</label>
      <input name="first_name" value={form.first_name} onChange={handleChange} />

      <label>Last Name</label>
      <input name="last_name" value={form.last_name} onChange={handleChange} />

      <label>Phone Number</label>
      <input name="phone_number" value={form.phone_number} onChange={handleChange} />

      <h4>Address (optional)</h4>
      <label>Address Details</label>
      <input name="address_details" value={form.address_details} onChange={handleChange} />

      <label>City</label>
      <input name="city" value={form.city} onChange={handleChange} />

      <label>State</label>
      <input name="state" value={form.state} onChange={handleChange} />

      <label>Pin Code</label>
      <input name="pin_code" value={form.pin_code} onChange={handleChange} />

      <button type="submit">{initialData ? "Update" : "Create"}</button>
    </form>
  );
}

export default CustomerForm;
