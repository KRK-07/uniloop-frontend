import { useState } from "react";
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
      console.error(error);
      alert("Failed to add resource!");
    }
  };

  return (
    <div>
      <h1>Add Resource</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Resource Name"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Books">Books</option>
          <option value="Equipment">Equipment</option>
          <option value="Electronics">Electronics</option>
          <option value="Notes">Notes</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          name="ownerName"
          placeholder="Your Name"
          value={form.ownerName}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Add Resource
        </button>

      </form>
    </div>
  );
}

export default AddResource;