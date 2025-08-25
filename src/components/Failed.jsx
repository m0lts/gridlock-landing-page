import GridlockLogo from "../assets/logo-white.png";
import { useState } from "react";
import { useEffect } from "react";
export default function Success() {
  const [countdown, setCountdown] = useState(4);

  // const Token = new URLSearchParams(window.location.search).get("token");
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Close the page after countdown reaches 0
      window.location.href = "com.gridlock.staging://close";
    }
  }, [countdown]);
  return (
    <section className="hero">
      <div className="hero-background" />
      <header className="hero-logo">
        <img
          src={GridlockLogo}
          alt="Gridlock Logo"
          style={{ width: 140, height: 140 }}
        />
      </header>
      <div style={{ textAlign: "center", color: "white" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: 20,
            borderRadius: "50%",
            backgroundColor: "white",
            width: 80,
            height: 80,
            marginLeft: "auto",
            marginRight: "auto",
            padding: 10,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            border: "2px solid red",
            boxSizing: "border-box",
            marginBottom: 30,
            marginTop: 30,
            transform: "scale(1.2)",
            transition: "transform 0.3s ease-in-out",
            cursor: "pointer",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="red"
            width="48"
            height="48"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="18"
              x2="18"
              y2="6"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 style={{ color: "red" }}>Payment Failed!</h1>
        <p style={{ marginTop: 20 }}>
          Redirecting to home in {countdown} seconds...
        </p>
      </div>
    </section>
  );
}
