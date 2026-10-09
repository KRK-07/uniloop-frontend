
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    axios
      .get("https://uniloop-backend-jl0r.onrender.com/api/resources")
      .then((response) => {
        setResources(response.data);
      })
      .catch((error) => {
        console.error("Error fetching resources:", error);
      });
  }, []);

  const handleBorrow = async (resourceId) => {
    const requesterEmail = prompt("Enter your email:");

    if (!requesterEmail) {
      return;
    }

    try {
      await axios.post(
        "https://uniloop-backend-jl0r.onrender.com/api/borrow-requests",
        {
          resourceId: resourceId,
          requesterEmail: requesterEmail
        }
      );

      alert("Borrow request sent successfully!");
    } catch (error) {
      console.error("Borrow request error:", error);
      alert("Failed to send borrow request!");
    }
  };

  const filteredResources = resources.filter((resource) => {
    const title = resource.title || "";
    const description = resource.description || "";

    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || resource.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dashboard">

      {/* Dashboard Hero */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <div className="dashboard-intro">
            <span className="dashboard-eyebrow">
              UNILOOP COMMUNITY
            </span>

            <h1>
              Find what you
              <span> need.</span>
            </h1>

            <p>
              Discover useful resources shared by students on your campus.
              Borrow what you need and give back when you're done.
            </p>
          </div>

          <Link
            to="/add-resource"
            className="dashboard-add-button"
          >
            <span>+</span>
            Add Resource
          </Link>

        </div>

      </section>


      {/* Search & Categories */}

      <section className="resource-controls">

        <div className="search-wrapper">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search books, equipment, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>


        <div className="category-row">

          <div className="category-title">
            Browse by category
          </div>

          <div className="category-filters">

            {[
              "All",
              "Books",
              "Equipment",
              "Electronics",
              "Notes",
              "Other"
            ].map((item) => (

              <button
                key={item}
                onClick={() => setCategory(item)}
                className={
                  category === item
                    ? "category-filter active"
                    : "category-filter"
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </section>


      {/* Resources */}

      <section className="resources-section">

        <div className="resources-heading">

          <div>
            <span className="resources-eyebrow">
              CAMPUS RESOURCES
            </span>

            <h2>
              Available resources
            </h2>
          </div>

          <span className="resource-count">
            {filteredResources.length}{" "}
            {filteredResources.length === 1
              ? "resource"
              : "resources"}
          </span>

        </div>


        {filteredResources.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🔎
            </div>

            <h3>
              No resources found
            </h3>

            <p>
              Try a different search or share something useful
              with your campus.
            </p>

            <Link
              to="/add-resource"
              className="empty-button"
            >
              + Add a Resource
            </Link>

          </div>

        ) : (

          <div className="resource-grid">

            {filteredResources.map((resource) => (

              <div
                className="resource-card"
                key={resource.id}
              >

                {/* Card Top */}

                <div className="resource-card-top">

                  <span className="resource-category">
                    {resource.category}
                  </span>

                  <span
                    className={
                      resource.available
                        ? "availability available"
                        : "availability unavailable"
                    }
                  >
                    <span className="availability-dot"></span>

                    {resource.available
                      ? "Available"
                      : "Unavailable"}
                  </span>

                </div>


                {/* Resource Info */}

                <div className="resource-info">

                  <h3>
                    {resource.title}
                  </h3>

                  <p className="resource-description">
                    {resource.description}
                  </p>

                </div>


                {/* Owner */}

                <div className="resource-owner">

                  <div className="owner-avatar">
                    {resource.ownerName
                      ? resource.ownerName
                          .charAt(0)
                          .toUpperCase()
                      : "U"}
                  </div>

                  <div className="owner-details">

                    <small>
                      Shared by
                    </small>

                    <p>
                      {resource.ownerName || "Student"}
                    </p>

                  </div>

                </div>


                {/* Borrow Button */}

                <button
                  className="borrow-button"
                  onClick={() => handleBorrow(resource.id)}
                  disabled={!resource.available}
                >
                  {resource.available
                    ? "Request to Borrow"
                    : "Currently Unavailable"}

                  {resource.available && (
                    <span className="button-arrow">
                      →
                    </span>
                  )}
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;

