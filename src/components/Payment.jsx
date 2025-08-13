import { useEffect, useState } from "react";
import GridlockLogo from "../assets/logo-white.png";
import GridBrainImage from "../assets/GridBrain.png";
import TokenImage from "../assets/token.png";
import Token1 from "../assets/token1.png";
import Token6 from "../assets/token6.png";
import Token12 from "../assets/token12.png";
import Token24 from "../assets/token24.png";

export default function Payment() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <section className="hero">
      <div className="hero-background" />
      <header className="hero-logo">
        <img
          src={GridlockLogo}
          alt="Gridlock Logo"
          style={{ width: 150, height: 150 }}
        />
      </header>
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          width: screenWidth > 900 ? "50%" : "90%",
          marginTop: 100,
        }}
      >
        <h1 style={{ fontSize: screenWidth > 900 ? 48 : 36, fontWeight: 700 }}>
          GRIDBRAIN TOKEN
        </h1>
        <p style={{ fontSize: 16, fontWeight: 400 }}>
          GridBrain is the official token of Gridlock. It is used to purchase
          Gridlock&apos;s services and products.
        </p>
      </div> */}
      <div
        className="fantasy"
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 2,
          gridRowStart: 2,
          gridRowEnd: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: screenWidth > 900 ? 100 : screenWidth < 768 ? 175 : 25,
            backgroundColor: "white",
            padding: 6,
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            marginBottom: 50,
          }}
        >
          <img
            src={GridBrainImage}
            alt="GridBrain"
            style={{
              width: screenWidth > 400 ? 60 : 40,
              height: screenWidth > 400 ? 60 : 40,
            }}
          />
          <h2
            style={{
              textTransform: "uppercase",
              fontSize: screenWidth > 400 ? 36 : 24,
              fontWeight: 700,
              position: "relative",
              color: "black",
            }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>GRIDBRAIN</span>
          </h2>
          <img
            src={TokenImage}
            alt="Token"
            style={{
              width: screenWidth > 400 ? 60 : 40,
              height: screenWidth > 400 ? 60 : 40,
            }}
          />
        </div>
        <p style={{ marginTop: 10, textAlign: "center", width: "70%" }}>
          Dive into AI track and car suitability analysis, driver stats, car
          performance data and track trends, all in one place. Make smarter
          predictions and climb the leaderboard with insights built for serious
          F1 fans.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: screenWidth > 900 ? "50%" : "90%",
            marginTop: 100,
          }}
        >
          <h1
            style={{ fontSize: screenWidth > 900 ? 48 : 36, fontWeight: 700 }}
          >
            AVAILABLE TOKENS
          </h1>
        </div>

        {/* Token Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: screenWidth > 768 ? "repeat(2, 1fr)" : "1fr",
            gap: 20,
            width: screenWidth > 900 ? "60%" : "90%",
            marginTop: 50,
            marginBottom: 50,
          }}
        >
          {/* 1 TOKEN Card */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              border: "1px solid #fff",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-8px)";
              e.target.style.boxShadow = "0 20px 40px rgba(100, 108, 255, 0.3)";
              e.target.style.borderColor = "#C753F8";
              e.target.style.backgroundColor = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#fff";
              e.target.style.backgroundColor = "#1a1a1a";
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={Token1}
                alt="Token"
                style={{
                  width: 80,
                  height: 80,
                }}
              />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
              1 TOKEN
            </h3>
            <p style={{ fontSize: 14, color: "white", textAlign: "center" }}>
              Smash a weekend.
            </p>
          </div>

          {/* 6 TOKENS Card */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              border: "1px solid #fff",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-8px)";
              e.target.style.boxShadow = "0 20px 40px rgba(100, 108, 255, 0.3)";
              e.target.style.borderColor = "#C753F8";
              e.target.style.backgroundColor = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#fff";
              e.target.style.backgroundColor = "#1a1a1a";
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={Token6}
                alt="Token"
                style={{
                  width: 80,
                  height: 80,
                }}
              />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
              6 TOKENS
            </h3>
            <p style={{ fontSize: 14, color: "white", textAlign: "center" }}>
              For a Top Prediction streak.
            </p>
          </div>

          {/* 12 TOKENS Card */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              border: "1px solid #fff",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-8px)";
              e.target.style.boxShadow = "0 20px 40px rgba(100, 108, 255, 0.3)";
              e.target.style.borderColor = "#C753F8";
              e.target.style.backgroundColor = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#fff";
              e.target.style.backgroundColor = "#1a1a1a";
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={Token12}
                alt="Token"
                style={{
                  width: 80,
                  height: 80,
                }}
              />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
              12 TOKENS
            </h3>
            <p style={{ fontSize: 14, color: "white", textAlign: "center" }}>
              Half a season of insight.
            </p>
          </div>

          {/* 24 TOKENS Card */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              border: "1px solid #fff",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-8px)";
              e.target.style.boxShadow = "0 20px 40px rgba(100, 108, 255, 0.3)";
              e.target.style.borderColor = "#C753F8";
              e.target.style.backgroundColor = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#fff";
              e.target.style.backgroundColor = "#1a1a1a";
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={Token24}
                alt="Token"
                style={{
                  width: 80,
                  height: 80,
                }}
              />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
              24 TOKENS
            </h3>
            <p style={{ fontSize: 14, color: "white", textAlign: "center" }}>
              One token per race
            </p>
          </div>
        </div>
      </div>
      {/* <footer
        style={{
          width: "100%",
          backgroundColor: "rgb(109, 109, 109)",
          paddingLeft: "10%",
          paddingRight: "10%",
          paddingTop: 30,
          paddingBottom: 30,
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: screenWidth > 600 ? "row" : "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <img
            src={GridlockLogo}
            alt="Gridlock Logo"
            style={{ width: 100, height: 100 }}
          />
          <nav
            style={{
              display: "flex",
              flexDirection: screenWidth > 400 ? "row" : "column",
              alignItems: "center",
              justifyContent: "space-around",
              gap: 25,
            }}
          >
            <a href="#" style={{ color: "white" }}>
              Support
            </a>
            <a href="#" style={{ color: "white" }}>
              Privacy Policy
            </a>
            <a href="#" style={{ color: "white" }}>
              Terms Of Use
            </a>
            <a href="/payment" style={{ color: "white" }}>
              Payment
            </a>
          </nav>
        </div>
        <p style={{ marginTop: 15, marginBottom: 15 }}>
          This website is unofficial and is not associated in any way with the
          Formula One group of companies. F1, FORMULA ONE, FORMULA 1, FIA
          FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade
          marks of Formula One Licensing B.V. Gridlock is not affiliated with
          any of the drivers or teams displayed in our applications and such
          data is for informational purposes only.
        </p>
        <h4>&copy; 2024 Company 57 Limited. All rights reserved.</h4>
      </footer> */}
    </section>
  );
}
