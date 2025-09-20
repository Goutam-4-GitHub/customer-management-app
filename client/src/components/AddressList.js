import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Use your deployed backend URL
const API_URL = "https://customer-management-app-backends.onrender.com/api";

function AddressList({ customerId }) {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/customers/${customerId}/addresses`)
      .then((res) => setAddresses(res.data))
      .catch((err) => console.error(err));
  }, [customerId]);

  if (!addresses.length) return <p>No addresses found.</p>;

  return (
    <ul>
      {addresses.map((a) => (
        <li key={a.id}>
          {a.address_details}, {a.city}, {a.state}, {a.pin_code}
        </li>
      ))}
    </ul>
  );
}

export default AddressList;
