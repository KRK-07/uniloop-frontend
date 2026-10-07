
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function AddResource() {
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

    try {
      const response = await axios.post(
        "http://localhost:8080/api/resources",
        form
      );

      console.log(response.data);

      alert("Resource added successfully!");

      setForm({
        title: "",
        description: "",
        category: "",
        ownerName: ""
      });

    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Failed to add resource!");
    }
  };

  return (
    <div className="resource-page">

      <div className="resource-form-card">

        <div className="resource-form-header">

          <Link
            to="/dashboard"
            className="back-link"
          >
            ← Back to Dashboard
          </Link>

          <div className="resource-form-logo">
            +
          </div>

          <p className="auth-label">
            SHARE WITH YOUR CAMPUS
          </p>

          <h1>
            Add a Resource
          </h1>

          <p>
            Have something useful? List it here so another
            student can borrow it.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="resource-form"
        >

          <div className="form-group">

            <label>
              Resource Name
            </label>

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

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Tell students a little about this resource..."
              value={form.description}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >

              <option value="">
                Select a category
              </option>

              <option value="Books">
                Books
              </option>

              <option value="Equipment">
                Equipment
              </option>

              <option value="Electronics">
                Electronics
              </option>

              <option value="Notes">
                Notes
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div className="form-group">

            <label>
              Your Name
            </label>

            <input
              type="text"
              name="ownerName"
              placeholder="Enter your name"
              value={form.ownerName}
              onChange={handleChange}
              required
            />

          </div>


          <button
            type="submit"
            className="resource-submit-button"
          >
            Add Resource
            <span>→</span>
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddResource;

