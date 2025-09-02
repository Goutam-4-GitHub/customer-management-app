import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerForm from "../components/CustomerForm";

function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/customers/${id}`)
        .then((res) => setCustomer(res.data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  const handleSubmit = (data) => {
    if (id) {
      axios.put(`http://localhost:5000/api/customers/${id}`, data)
  .then((res) => {
    console.log("Customer updated:", res.data);
    navigate("/");
  })
  .catch((err) => {
    alert(err.response?.data?.error || "Error updating customer");
  });

    } else {
      axios.post("http://localhost:5000/api/customers", data)
  .then((res) => {
    console.log("Customer created:", res.data);
    navigate("/");
  })
  .catch((err) => {
    alert(err.response?.data?.error || "Error creating customer");
  });

    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{id ? "Edit Customer" : "New Customer"}</h2>
      <CustomerForm onSubmit={handleSubmit} initialData={customer} />
    </div>
  );
}

export default CustomerFormPage;
