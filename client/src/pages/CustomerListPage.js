import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch customers from backend
  const fetchCustomers = () => {
    axios
      .get("http://localhost:5000/api/customers", {
        params: { search, city, state, pin, page, limit: 5 },
      })
      .then((response) => {
        // Backend might return array OR { data, totalPages }
        if (Array.isArray(response.data)) {
          setCustomers(response.data);
          setTotalPages(1);
        } else if (response.data.data) {
          setCustomers(response.data.data);
          setTotalPages(response.data.totalPages || 1);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Handle search/filters
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setState("");
    setPin("");
    setPage(1);
    fetchCustomers();
  };

  // Delete customer with confirmation
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      axios
        .delete(`http://localhost:5000/api/customers/${id}`)
        .then(() => {
          alert("Customer deleted successfully");
          fetchCustomers();
        })
        .catch((err) => {
          alert(err.response?.data?.error || "Error deleting customer");
        });
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Customer List</h2>

      {/* Search + Filter Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Search name/phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        <input
          placeholder="Pin Code"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button type="submit">🔍 Search</button>
        <button type="button" onClick={clearFilters}>
          Clear
        </button>
      </form>

      {/* Customer List */}
      <ul>
        {customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          customers.map((c) => (
            <li key={c.id}>
              <Link to={`/customers/${c.id}`}>
                {c.first_name} {c.last_name}
              </Link>{" "}
              ({c.phone_number})
              {" | "}
              <Link to={`/edit/${c.id}`}>✏️ Edit</Link>
              {" | "}
              <button
                onClick={() => handleDelete(c.id)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  marginLeft: "10px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🗑 Delete
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Pagination */}
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          ⬅ Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}

export default CustomerListPage;
