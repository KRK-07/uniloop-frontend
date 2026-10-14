
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddResource from "./pages/AddResource";

import "./App.css";

function Navbar({ isLoggedIn, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        UNILOOP
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/dashboard">Dashboard</Link>

        {isLoggedIn ? (
          <button
            type="button"
            className="nav-register"
            onClick={onLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>

            <Link to="/register" className="nav-register">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Home({ isLoggedIn }) {
  return (
    <div className="app">
      <section className="hero">
        <p className="home-eyebrow">
          CAMPUS RESOURCE SHARING
        </p>

        <h1>
          Share. Borrow.
          <br />
          Return. Repeat.
        </h1>

        <p>
          A student-powered platform to share and borrow
          useful resources within your campus.
        </p>

        {!isLoggedIn && (
          <Link to="/register">
            <button className="get-started">
              Get Started
            </button>
          </Link>
        )}

        {isLoggedIn && (
          <Link to="/dashboard">
            <button className="get-started">
              Explore Resources
            </button>
          </Link>
        )}
      </section>

      <section className="categories">
        <h2>What can you share?</h2>

        <div className="category-container">
          <div className="category-card">
            <h3>📚 Books</h3>
            <p>Textbooks, reference books and study material.</p>
          </div>

          <div className="category-card">
            <h3>🔧 Equipment</h3>
            <p>Calculators, lab equipment and project kits.</p>
          </div>

          <div className="category-card">
            <h3>💻 Electronics</h3>
            <p>Chargers, cables, accessories and more.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How UNILOOP Works</h2>

        <div className="steps">
          <div>
            <span>1</span>
            <h3>List</h3>
            <p>Add a resource you want to share.</p>
          </div>

          <div>
            <span>2</span>
            <h3>Request</h3>
            <p>Students can request to borrow it.</p>
          </div>

          <div>
            <span>3</span>
            <h3>Return</h3>
            <p>Return the resource and complete the loop.</p>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2026 UNILOOP — Share. Borrow. Return. Repeat.</p>
      </footer>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("uniloopLoggedIn") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("uniloopLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("uniloopLoggedIn");
    setIsLoggedIn(false);
    window.location.assign("/");
  };

  return (
    <BrowserRouter>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={<Home isLoggedIn={isLoggedIn} />}
        />

        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />

        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-resource" element={<AddResource />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
