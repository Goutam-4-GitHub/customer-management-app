import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddressList from "../components/AddressList";
import AddressForm from "../components/AddressForm";

function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/customers/${id}`)
      .then((res) => setCustomer(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!customer) return <p>Loading...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{customer.first_name} {customer.last_name}</h2>
      <p>Phone: {customer.phone_number}</p>

      <h3>Addresses</h3>
      <AddressList customerId={id} />
      <h4>Add New Address</h4>
      <AddressForm customerId={id} />
    </div>
  );
}

export default CustomerDetailPage;
