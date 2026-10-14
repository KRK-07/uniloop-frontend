
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "https://uniloop-backend-jl0r.onrender.com/api";
const POLL_INTERVAL = 5000;

function Dashboard() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [view, setView] = useState("browse");

  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);

  const [notification, setNotification] = useState(null);

  // Stores the last known status of each borrow request.
  const previousStatuses = useRef(null);

  const ownerEmail = (
    localStorage.getItem("uniloopUserEmail") || ""
  ).trim();

  // Load resources.
  const loadResources = async () => {
    try {
      const response = await axios.get(`${API}/resources`);
      setResources(response.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Automatically check the borrower's requests every 5 seconds.
  useEffect(() => {
    if (!ownerEmail) return;

    let cancelled = false;

    const checkRequestStatuses = async () => {
      try {
        const response = await axios.get(
          `${API}/borrow-requests/user/${encodeURIComponent(ownerEmail)}`
        );

        if (cancelled) return;

        const latestRequests = response.data;

        const currentStatuses = new Map(
          latestRequests.map((request) => [
            String(request.id),
            request.status
          ])
        );

        // The first fetch establishes the baseline.
        // Do not notify about old requests when the page first loads.
        if (previousStatuses.current === null) {
          previousStatuses.current = currentStatuses;

          if (view === "myRequests") {
            setMyRequests(latestRequests);
          }

          return;
        }

        let newNotification = null;

        for (const request of latestRequests) {
          const id = String(request.id);
          const previousStatus = previousStatuses.current.get(id);

          const statusChanged =
            previousStatus !== undefined &&
            previousStatus !== request.status;

          const newProcessedRequest =
            previousStatus === undefined &&
            request.status !== "PENDING";

          if (
            (statusChanged || newProcessedRequest) &&
            (request.status === "APPROVED" ||
              request.status === "REJECTED")
          ) {
            newNotification = {
              id: `${id}-${request.status}-${Date.now()}`,
              status: request.status,
              message:
                request.status === "APPROVED"
                  ? "Your borrow request has been approved!"
                  : "Your borrow request has been rejected."
            };
          }
        }

        previousStatuses.current = currentStatuses;

        // Update the borrower's request cards automatically.
        if (view === "myRequests") {
          setMyRequests(latestRequests);
        }

        // Display the latest status-change notification.
        if (newNotification) {
          setNotification(newNotification);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Automatic status check failed:",
            error
          );
        }
      }
    };

    checkRequestStatuses();

    const intervalId = setInterval(
      checkRequestStatuses,
      POLL_INTERVAL
    );

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [ownerEmail, view]);

  // Send a borrow request.
  const handleBorrow = async (resourceId) => {
    if (!ownerEmail) {
      alert("Please log in before requesting a resource.");
      return;
    }

    try {
      await axios.post(`${API}/borrow-requests`, {
        resourceId,
        requesterEmail: ownerEmail
      });

      alert("Borrow request sent successfully!");

      // Refresh the request list if it has already been opened.
      if (view === "myRequests") {
        loadMyRequests();
      }
    } catch (error) {
      console.error("Borrow request error:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : "Failed to send borrow request.")
      );
    }
  };

  // Load requests received by the resource owner.
  const openReceivedRequests = async () => {
    if (!ownerEmail) {
      alert("Please log in first to view received requests.");
      return;
    }

    setView("received");
    setLoadingRequests(true);

    try {
      const response = await axios.get(
        `${API}/borrow-requests/received`,
        { params: { ownerEmail } }
      );

      setRequests(response.data);
    } catch (error) {
      console.error("Error loading received requests:", error);
      alert("Could not load received requests.");
    } finally {
      setLoadingRequests(false);
    }
  };

  // Refresh the owner's inbox.
  const openRequestsAgain = async () => {
    if (!ownerEmail) return;

    setLoadingRequests(true);

    try {
      const response = await axios.get(
        `${API}/borrow-requests/received`,
        { params: { ownerEmail } }
      );

      setRequests(response.data);
    } catch (error) {
      console.error("Error refreshing requests:", error);
      alert("Could not refresh requests.");
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load requests sent by the logged-in student.
  const loadMyRequests = async () => {
    if (!ownerEmail) {
      alert("Please log in first to view your borrow requests.");
      return;
    }

    setView("myRequests");
    setLoadingMyRequests(true);

    try {
      const response = await axios.get(
        `${API}/borrow-requests/user/${encodeURIComponent(ownerEmail)}`
      );

      setMyRequests(response.data);
    } catch (error) {
      console.error("Error loading my requests:", error);
      alert("Could not load your borrow requests.");
    } finally {
      setLoadingMyRequests(false);
    }
  };

  // Approve or reject a request.
  const handleDecision = async (requestId, decision) => {
    if (!ownerEmail) {
      alert("Please log in first.");
      return;
    }

    const action = decision === "approve" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this request?`)) {
      return;
    }

    try {
      await axios.put(
        `${API}/borrow-requests/${requestId}/${action}`,
        null,
        { params: { ownerEmail } }
      );

      alert(
        decision === "approve"
          ? "Request approved!"
          : "Request rejected."
      );

      await Promise.all([
        openRequestsAgain(),
        loadResources()
      ]);
    } catch (error) {
      console.error("Request decision error:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : `Could not ${action} the request.`)
      );
    }
  };

  // Filter resources.
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

  const getResource = (resourceId) =>
    resources.find(
      (resource) =>
        String(resource.id) === String(resourceId)
    );

  const getStatusMessage = (status) => {
    if (status === "APPROVED") {
      return "Great news! Your borrow request was approved.";
    }

    if (status === "REJECTED") {
      return "Your borrow request was rejected.";
    }

    return "Waiting for the resource owner to respond.";
  };

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-intro">
            <span className="dashboard-eyebrow">
              UNILOOP COMMUNITY
            </span>

            <h1>
              {view === "browse" ? (
                <>Find what you<span> need.</span></>
              ) : view === "received" ? (
                <>Manage your<span> requests.</span></>
              ) : (
                <>Track your<span> requests.</span></>
              )}
            </h1>

            <p>
              {view === "browse"
                ? "Discover useful resources shared by students on your campus."
                : view === "received"
                  ? "Review requests from students who want to borrow your resources."
                  : "Check the latest status of resources you've requested."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            <button
              type="button"
              className="dashboard-add-button"
              onClick={() => setView("browse")}
            >
              Browse Resources
            </button>

            <button
              type="button"
              className="dashboard-add-button"
              onClick={openReceivedRequests}
            >
              Requests Received
            </button>

            <button
              type="button"
              className="dashboard-add-button"
              onClick={loadMyRequests}
            >
              My Borrow Requests
            </button>

            <Link
              to="/add-resource"
              className="dashboard-add-button"
            >
              + Add Resource
            </Link>
          </div>
        </div>
      </section>

      {/* Automatic in-app notification */}
      {notification && (
        <section
          role="status"
          aria-live="polite"
          style={{
            margin: "20px auto",
            padding: "16px 20px",
            maxWidth: "1200px",
            borderRadius: "12px",
            border: "1px solid #86cfa5",
            background: "#eaf8ef",
            color: "#174c2d",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div>
            <strong>
              {notification.status === "APPROVED"
                ? "Request approved!"
                : "Request update"}
            </strong>
            <p style={{ margin: "5px 0 0" }}>
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Dismiss notification"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "22px"
            }}
          >
            ×
          </button>
        </section>
      )}

      {/* Browse resources */}
      {view === "browse" && (
        <>
          <section className="resource-controls">
            <div className="search-wrapper">
              <span className="search-icon">⌕</span>

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

          <section className="resources-section">
            <div className="resources-heading">
              <div>
                <span className="resources-eyebrow">
                  CAMPUS RESOURCES
                </span>
                <h2>Available resources</h2>
              </div>

              <span className="resource-count">
                {filteredResources.length} resources
              </span>
            </div>

            {filteredResources.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔎</div>
                <h3>No resources found</h3>
                <p>
                  Try a different search or share something useful.
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
                {filteredResources.map((resource) => {
                  const isOwner =
                    resource.ownerEmail &&
                    resource.ownerEmail.toLowerCase() ===
                      ownerEmail.toLowerCase();

                  return (
                    <div
                      className="resource-card"
                      key={resource.id}
                    >
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

                      <div className="resource-info">
                        <h3>{resource.title}</h3>
                        <p className="resource-description">
                          {resource.description}
                        </p>
                      </div>

                      <div className="resource-owner">
                        <div className="owner-avatar">
                          {resource.ownerName
                            ? resource.ownerName.charAt(0).toUpperCase()
                            : "U"}
                        </div>

                        <div className="owner-details">
                          <small>Shared by</small>
                          <p>{resource.ownerName || "Student"}</p>
                        </div>
                      </div>

                      <button
                        className="borrow-button"
                        onClick={() => handleBorrow(resource.id)}
                        disabled={!resource.available || isOwner}
                      >
                        {isOwner
                          ? "Your Resource"
                          : resource.available
                            ? "Request to Borrow"
                            : "Currently Unavailable"}

                        {resource.available && !isOwner && (
                          <span className="button-arrow">→</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Requests received by owner */}
      {view === "received" && (
        <section className="resources-section">
          <div className="resources-heading">
            <div>
              <span className="resources-eyebrow">
                OWNER INBOX
              </span>
              <h2>Requests Received</h2>
              <p>Signed in as: {ownerEmail}</p>
            </div>

            <button
              className="dashboard-add-button"
              onClick={openRequestsAgain}
            >
              Refresh
            </button>
          </div>

          {loadingRequests ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <h3>No requests found</h3>
              <p>
                Requests for your resources will appear here.
              </p>
            </div>
          ) : (
            <div className="resource-grid">
              {requests.map((request) => {
                const resource = getResource(request.resourceId);

                return (
                  <div
                    className="resource-card"
                    key={request.id}
                  >
                    <div className="resource-card-top">
                      <span className="resource-category">
                        {resource?.category || "Resource"}
                      </span>

                      <span className="availability">
                        {request.status}
                      </span>
                    </div>

                    <div className="resource-info">
                      <h3>
                        {resource?.title ||
                          `Resource #${request.resourceId}`}
                      </h3>
                      <p className="resource-description">
                        {resource?.description || ""}
                      </p>
                    </div>

                    <div className="resource-owner">
                      <div className="owner-avatar">
                        {(request.requesterEmail || "?")
                          .charAt(0).toUpperCase()}
                      </div>

                      <div className="owner-details">
                        <small>Requested by</small>
                        <p>{request.requesterEmail}</p>
                      </div>
                    </div>

                    {request.status === "PENDING" ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "16px"
                        }}
                      >
                        <button
                          className="borrow-button"
                          onClick={() =>
                            handleDecision(request.id, "approve")
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="borrow-button"
                          onClick={() =>
                            handleDecision(request.id, "reject")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <p style={{ marginTop: "16px" }}>
                        This request has been processed.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Requests sent by the logged-in student */}
      {view === "myRequests" && (
        <section className="resources-section">
          <div className="resources-heading">
            <div>
              <span className="resources-eyebrow">
                BORROWER INBOX
              </span>

              <h2>My Borrow Requests</h2>
              <p>Signed in as: {ownerEmail}</p>
            </div>

            <button
              className="dashboard-add-button"
              onClick={loadMyRequests}
            >
              Refresh Status
            </button>
          </div>

          {loadingMyRequests ? (
            <p>Loading your requests...</p>
          ) : myRequests.length === 0 ? (
            <div className="empty-state">
              <h3>No borrow requests yet</h3>
              <p>
                Requests you send to resource owners will appear here.
              </p>
            </div>
          ) : (
            <div className="resource-grid">
              {myRequests.map((request) => {
                const resource = getResource(request.resourceId);

                return (
                  <div
                    className="resource-card"
                    key={request.id}
                  >
                    <div className="resource-card-top">
                      <span className="resource-category">
                        {resource?.category || "Resource"}
                      </span>

                      <span
                        className={
                          request.status === "APPROVED"
                            ? "availability available"
                            : request.status === "REJECTED"
                              ? "availability unavailable"
                              : "availability"
                        }
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="resource-info">
                      <h3>
                        {resource?.title ||
                          `Resource #${request.resourceId}`}
                      </h3>

                      <p className="resource-description">
                        {resource?.description || ""}
                      </p>

                      <p style={{ marginTop: "12px" }}>
                        {getStatusMessage(request.status)}
                      </p>
                    </div>

                    <button
                      className="borrow-button"
                      onClick={loadMyRequests}
                    >
                      Refresh Status
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Dashboard;
