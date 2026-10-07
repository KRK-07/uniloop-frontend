
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/resources")
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
      const response = await axios.post(
        "http://localhost:8080/api/borrow-requests",
        {
          resourceId: resourceId,
          requesterEmail: requesterEmail
        }
      );

      console.log("Borrow request:", response.data);

      alert("Borrow request sent successfully!");

    } catch (error) {
      console.error("Borrow request error:", error);
      alert("Failed to send borrow request!");
    }
  };

  return (
    <div>
      <h1>Welcome to UNILOOP</h1>

      <p>You are successfully logged in!</p>

      <Link to="/add-resource">
        <button>Add Resource</button>
      </Link>

      <h2>Available Resources</h2>

      {resources.length === 0 ? (
        <p>No resources available yet.</p>
      ) : (
        resources.map((resource) => (
          <div key={resource.id}>

            <h3>{resource.title}</h3>

            <p>{resource.description}</p>

            <p>Category: {resource.category}</p>

            <p>Owner: {resource.ownerName}</p>

            <p>
              Status: {resource.available ? "Available" : "Not Available"}
            </p>

            {resource.available && (
              <button onClick={() => handleBorrow(resource.id)}>
                Borrow
              </button>
            )}

            <hr />

          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;
