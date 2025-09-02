import React, { useState } from "react";
import axios from "axios";

function AddressForm({ customerId }) {
  const [form, setForm] = useState({
    address_details: "",
    city: "",
    state: "",
    pin_code: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:5000/api/customers/${customerId}/addresses`, form)
      .then((res) => {
        console.log("Address added:", res.data);
        setForm({ address_details: "", city: "", state: "", pin_code: "" });
        window.location.reload(); // quick refresh for now
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Error adding address");
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="address_details"
        placeholder="Address"
        value={form.address_details}
        onChange={handleChange}
      />
      <input
        name="city"
        placeholder="City"
        value={form.city}
        onChange={handleChange}
      />
      <input
        name="state"
        placeholder="State"
        value={form.state}
        onChange={handleChange}
      />
      <input
        name="pin_code"
        placeholder="Pin Code"
        value={form.pin_code}
        onChange={handleChange}
      />
      <button type="submit">Add Address</button>
    </form>
  );
}

export default AddressForm;
