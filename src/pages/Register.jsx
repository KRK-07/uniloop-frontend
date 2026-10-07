
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/register",
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        }
      );

      console.log("Registration response:", response.data);

      alert("Registration successful!");

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });

    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed!");
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card register-card">

        <div className="auth-header">

          <div className="auth-logo">
            U
          </div>

          <p className="auth-label">
            JOIN UNILOOP
          </p>

          <h1>
            Create your account
          </h1>

          <p>
            Join your campus community and start sharing resources.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Email address
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>


          <button
            type="submit"
            className="auth-button"
          >
            Create Account
          </button>

        </form>


        <div className="auth-divider">

          <span></span>

          <p>
            Already have an account?
          </p>

          <span></span>

        </div>


        <p className="auth-footer">

          <Link to="/login">
            Login to your account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;

