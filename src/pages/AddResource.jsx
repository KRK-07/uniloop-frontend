
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://uniloop-backend-jl0r.onrender.com/api";

function AddResource() {
  const navigate = useNavigate();

  const ownerEmail = (
    localStorage.getItem("uniloopUserEmail") || ""
  ).trim();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    ownerName: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ownerEmail) {
      alert("Please log in before adding a resource.");
      navigate("/login");
      return;
    }

    try {
      const resourceData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        ownerName: form.ownerName.trim(),
        ownerEmail: ownerEmail
      };

      const response = await axios.post(
        `${API}/resources`,
        resourceData
      );

      console.log("Resource added:", response.data);

      alert("Resource added successfully!");

      setForm({
        title: "",
        description: "",
        category: "",
        ownerName: ""
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding resource:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : "Failed to add resource!")
      );
    }
  };

  return (
    <div className="resource-page">
      <div className="resource-form-card">
        <div className="resource-form-header">
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>

          <div className="resource-form-logo">+</div>

          <p className="auth-label">
            SHARE WITH YOUR CAMPUS
          </p>

          <h1>Add a Resource</h1>

          <p>
            Have something useful? List it here so another
            student can borrow it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="resource-form">
          <div className="form-group">
            <label>Resource Name</label>

            <input
              type="text"
              name="title"
              placeholder="e.g. Data Structures Textbook"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Tell students about this resource..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Books">Books</option>
              <option value="Equipment">Equipment</option>
              <option value="Electronics">Electronics</option>
              <option value="Notes">Notes</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Name</label>

            <input
              type="text"
              name="ownerName"
              placeholder="Enter your name"
              value={form.ownerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Your Account Email</label>

            <input
              type="email"
              value={ownerEmail}
              readOnly
              disabled
            />

            <small>
              Automatically taken from your logged-in account.
            </small>
          </div>

          <button
            type="submit"
            className="resource-submit-button"
          >
            Add Resource <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddResource;
