
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
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
        "https://uniloop-backend-jl0r.onrender.com/api/users/login",
        {
          email: form.email,
          password: form.password
        }
      );

      console.log("Backend response:", response.data);

      if (response.data === "Login successful") {
        navigate("/dashboard");
      } else {
        alert(response.data);
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed!");
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <div className="auth-logo">
            U
          </div>

          <p className="auth-label">
            WELCOME BACK
          </p>

          <h1>
            Login to UNILOOP
          </h1>

          <p>
            Access resources shared by your campus community.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

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
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />

          </div>


          <button
            type="submit"
            className="auth-button"
          >
            Login
          </button>

        </form>


        <div className="auth-divider">
          <span></span>
          <p>New to UNILOOP?</p>
          <span></span>
        </div>


        <p className="auth-footer">
          <Link to="/register">
            Create your account
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;

