import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GridlockLogo from "../assets/logo-white.png";
import GridBrainImage from "../assets/GridBrain.png";
import TokenImage from "../assets/token.png";
import Token1 from "../assets/token1.png";
import Token6 from "../assets/token6.png";
import Token12 from "../assets/token12.png";
import Token24 from "../assets/token24.png";

export default function Payment() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTokenCardClick = async (productId) => {
    const clientReferenceId = encodeURIComponent(userId || "anonymous");

    if (typeof productId === "string" && productId.startsWith("prod_")) {
      try {
        const response = await fetch(
          "https://europe-west2-gridlock-dev-e8594.cloudfunctions.net/createCheckoutSession",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId || "anonymous", productId }),
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json().catch(() => ({}));
        const checkoutUrl = data.url || data.checkoutUrl || data.stripeUrl;

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          console.error("No checkout URL returned:", data);
          alert("Unable to start checkout. Please try again.");
        }
      } catch (error) {
        console.error("Failed to create checkout session:", error);
        alert("Unable to start checkout. Please try again.");
      }
    } else {
      const redirectUrl = `https://buy.stripe.com/${productId}?userid=${clientReferenceId}`;
      window.open(redirectUrl, "_blank");
    }
  };
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
          width: "100%",
          paddingLeft: screenWidth < 768 ? 20 : 0,
          paddingRight: screenWidth < 768 ? 20 : 0,
          marginTop: screenWidth < 768 ? -40 : -90,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              screenWidth > 900 ? "space-between" : "space-between",
            marginTop: screenWidth > 900 ? 80 : screenWidth < 768 ? 25 : 25,
            backgroundColor: "white",
            padding: 10,
            paddingLeft: screenWidth < 768 ? 8 : 30,
            paddingRight: screenWidth < 768 ? 8 : 30,
            borderRadius: 10,
            marginBottom: screenWidth < 768 ? 4 : 20,
            width:
              screenWidth > 900 ? "50%" : screenWidth < 768 ? "100%" : "50%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={GridBrainImage}
              alt="GridBrain"
              style={{
                width: screenWidth > 900 ? 100 : 60,
                height: screenWidth > 900 ? 100 : 60,
              }}
            />
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: screenWidth > 700 ? 46 : 26,
                fontWeight: 700,
                position: "relative",
                color: "black",
              }}
            >
              <span style={{ position: "relative", zIndex: 1 }}>GRIDBRAIN</span>
            </h2>
          </div>
          <img
            src={TokenImage}
            alt="Token"
            style={{
              width: screenWidth > 900 ? 100 : 60,
              height: screenWidth > 900 ? 100 : 60,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
            width: screenWidth > 900 ? "50%" : "100%",
            marginTop: 50,
            borderRadius: 4,
            padding: 10,
            paddingLeft: 20,
            paddingRight: 20,
            backgroundColor: "rgb(245, 245, 245, 0.1)",
            backdropFilter: "blur(10px)",
            marginBottom: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: screenWidth > 900 ? "100%" : "100%",
              marginTop: 10,
            }}
          >
            <h1
              style={{ fontSize: screenWidth > 900 ? 48 : 26, fontWeight: 700 }}
            >
              OUT-PREDICT EVERYONE
            </h1>
          </div>
          <p style={{ marginTop: 10, textAlign: "left" }}>
            Dive into AI track and car suitability analysis, driver stats, car
            performance data and track trends, all in one place. Make smarter
            predictions and climb the leaderboard with insights built for
            serious F1 fans.
          </p>
          {/* Token Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: screenWidth > 900 ? 20 : 10,
              width:
                screenWidth > 900 ? "100%" : screenWidth < 768 ? "100%" : "80%",
              marginTop: 50,
              marginBottom: 50,
            }}
          >
            {/* 1 TOKEN Card */}
            <div
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: screenWidth > 900 ? 16 : 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                border: "1px solid #fff",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: "translateY(0)",
                position: "relative",
                marginBottom: screenWidth < 768 ? 20 : 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-8px)";
                e.target.style.boxShadow =
                  "0 20px 40px rgba(100, 108, 255, 0.3)";
                e.target.style.borderColor = "#C753F8";
                e.target.style.backgroundColor = "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
                e.target.style.borderColor = "#fff";
                e.target.style.backgroundColor = "#1a1a1a";
              }}
              onClick={() => handleTokenCardClick("28E5kC4U72iU2v60HY4sE00")}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={Token1}
                  alt="Token"
                  style={{
                    width: screenWidth > 900 ? 120 : 80,
                    height: screenWidth > 900 ? 120 : 80,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: screenWidth > 900 ? 34 : 18,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                1 TOKEN
              </h3>
              <p
                style={{
                  fontSize: screenWidth > 900 ? 20 : 12,
                  color: "white",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Smash a weekend.
              </p>
              <div
                style={{
                  fontSize: screenWidth > 900 ? 34 : 18,
                  fontWeight: 700,
                  color: "white",
                  marginTop: "auto",
                  // paddingTop: 10,
                }}
              >
                £0.99
              </div>
            </div>

            {/* 6 TOKENS Card - MOST POPULAR */}
            <div
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: screenWidth > 900 ? 16 : 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                border: "2px solid #ff4757",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: "translateY(0)",
                position: "relative",
                marginBottom: screenWidth < 768 ? 20 : 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-8px)";
                e.target.style.boxShadow = "0 20px 40px rgba(255, 71, 87, 0.3)";
                e.target.style.borderColor = "#ff6b7a";
                e.target.style.backgroundColor = "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
                e.target.style.borderColor = "#ff4757";
                e.target.style.backgroundColor = "#1a1a1a";
              }}
              onClick={() => handleTokenCardClick("14A9AScmz0aMglWfCS4sE01")}
            >
              {/* MOST POPULAR Banner */}
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  right: 10,
                  backgroundColor: "#ff4757",
                  color: "white",
                  padding: "4px 16px",
                  borderRadius: 8,
                  fontSize: screenWidth > 900 ? 12 : 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Most Popular
              </div>
              <div style={{ position: "relative", marginTop: 8 }}>
                <img
                  src={Token6}
                  alt="Token"
                  style={{
                    width: screenWidth > 900 ? 120 : 80,
                    height: screenWidth > 900 ? 120 : 80,
                    // marginTop: screenWidth < 768 ? -10 : 0,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: screenWidth > 900 ? 34 : 18,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                6 TOKENS
              </h3>
              <p
                style={{
                  fontSize: screenWidth > 900 ? 20 : 12,
                  color: "white",
                  textAlign: "center",
                  // marginTop: screenWidth < 768 ? -10 : 2,
                }}
              >
                For a Top Prediction streak.
              </p>
              <div
                style={{
                  fontSize: screenWidth > 900 ? 34 : 18,
                  fontWeight: 700,
                  color: "white",
                  marginTop: "auto",
                  paddingTop: 16,
                }}
              >
                £4.49
              </div>
            </div>

            {/* 12 TOKENS Card */}
            <div
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: screenWidth > 900 ? 16 : 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                border: "1px solid #fff",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: "translateY(0)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-8px)";
                e.target.style.boxShadow =
                  "0 20px 40px rgba(100, 108, 255, 0.3)";
                e.target.style.borderColor = "#C753F8";
                e.target.style.backgroundColor = "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
                e.target.style.borderColor = "#fff";
                e.target.style.backgroundColor = "#1a1a1a";
              }}
              onClick={() => handleTokenCardClick("aFa3cu9an0aMc5G76m4sE02")}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={Token12}
                  alt="Token"
                  style={{
                    width: screenWidth > 900 ? 120 : 80,
                    height: screenWidth > 900 ? 120 : 80,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: screenWidth > 900 ? 34 : 18,
                  fontWeight: 700,
                  color: "white",
                  margin: 0,
                }}
              >
                12 TOKENS
              </h3>
              <p
                style={{
                  fontSize: screenWidth > 900 ? 20 : 12,
                  color: "white",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Half a season of insight.
              </p>
              <div
                style={{
                  fontSize: screenWidth > 900 ? 34 : 18,
                  fontWeight: 700,
                  color: "white",
                  marginTop: "auto",
                  // paddingTop: 16,
                }}
              >
                £7.99
              </div>
            </div>

            {/* 24 TOKENS Card - BEST VALUE */}
            <div
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: screenWidth > 900 ? 16 : 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                border: "2px solid #ffd700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: "translateY(0)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-8px)";
                e.target.style.boxShadow = "0 20px 40px rgba(255, 215, 0, 0.3)";
                e.target.style.borderColor = "#ffed4e";
                e.target.style.backgroundColor = "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
                e.target.style.borderColor = "#ffd700";
                e.target.style.backgroundColor = "#1a1a1a";
              }}
              onClick={() => handleTokenCardClick("7sY4gygCP1eQglW1M24sE03")}
            >
              {/* BEST VALUE Banner */}
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  right: 8,
                  backgroundColor: "#ffd700",
                  color: "black",
                  padding: "4px 16px",
                  borderRadius: 8,
                  fontSize: screenWidth > 900 ? 12 : 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Best Value
              </div>
              <div style={{ position: "relative", marginTop: 8 }}>
                <img
                  src={Token24}
                  alt="Token"
                  style={{
                    width: screenWidth > 900 ? 120 : 80,
                    height: screenWidth > 900 ? 120 : 80,
                    marginTop: screenWidth < 768 ? -10 : -5,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: screenWidth > 900 ? 34 : 18,
                  fontWeight: 700,
                  color: "white",
                  margin: 0,
                }}
              >
                24 TOKENS
              </h3>
              <p
                style={{
                  fontSize: screenWidth > 900 ? 20 : 12,
                  color: "white",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                One token per race.
              </p>
              <div
                style={{
                  fontSize: screenWidth > 900 ? 34 : 18,
                  fontWeight: 700,
                  color: "white",
                  marginTop: "auto",
                  // paddingTop: 16,
                }}
              >
                £13.99
              </div>
            </div>
          </div>
          {/* Add a button here to go to the payment page */}
          {/* <button
            style={{
              backgroundColor: "#e91e63",
              color: "white",
              padding: "15px 30px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: "translateY(0)",
              position: "relative",
              border: "none",
              fontSize: "16px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              boxShadow: "0 4px 15px rgba(233, 30, 99, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontFamily: "Arial, sans-serif",
              width: "100%",
              marginBottom: 50,
            }}
          >
            Use Your Token
            <span style={{ fontSize: "18px" }}>→</span>
          </button> */}
        </div>
      </div>
    </section>
  );
}
