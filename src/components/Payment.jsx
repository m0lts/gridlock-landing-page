import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GridlockLogo from "../assets/logo-white.png";
import GridBrainImage from "../assets/GridBrain.png";
import TokenImage from "../assets/token1.png";
import Token1 from "../assets/token1.png";
import Token6 from "../assets/token6.png";
import Token12 from "../assets/token12.png";
import Token24 from "../assets/token24.png";

export default function Payment() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const tokenCount = searchParams.get("token") || "0";
  const env = (searchParams.get("env") || "prod").toLowerCase();
  const isDev = env === "dev";
  const CHECKOUT_FN = isDev
    ? "https://europe-west2-gridlock-dev-e8594.cloudfunctions.net/createCheckoutSession"
    : "https://europe-west2-gridlock-3a102.cloudfunctions.net/createCheckoutSession";
  const [isLoading, setIsLoading] = useState(false);

  const PRICES = isDev
  ? {
      one: "price_1SKGnKB1y3JeZq39DgBjUOPV",
      six: "price_1SKGncB1y3JeZq39kGqQ4oEV",
      twelve: "price_1SKGnoB1y3JeZq39ikrEWrly",
      twentyFour: "price_1SKGnzB1y3JeZq39RZr2bf2N",
    }
  : {
      one: "price_1RsnNdB1y3JeZq39rIjSf6On",
      six: "price_1RsnOHB1y3JeZq39wGPdstNI",
      twelve: "price_1RsnPUB1y3JeZq39sziacMcd",
      twentyFour: "price_1RsnPqB1y3JeZq393Lpu2PgH",
    };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTokenCardClick = async (priceId) => {
    if (!userId && !isDev) {
      alert("Please sign in from the app to purchase tokens.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(CHECKOUT_FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          env,
          userId: userId || "anonymous",
          priceId,
          tokenCount: Number(tokenCount || 0),
        }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json().catch(() => ({}));
      const checkoutUrl = data.url || data.checkoutUrl || data.stripeUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, "_self");
      } else {
        console.error("No checkout URL returned:", data);
        alert("Unable to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      alert("Unable to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <section className="hero payment" style={{ backgroundColor: "#1a1a1a" }}>
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
          {/* <div
            style={{
              border: "2px solid #d946ef",
              borderRadius: 12,
              padding: screenWidth > 900 ? 16 : 12,
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              minWidth: screenWidth > 900 ? 120 : 80,
            }}
          >
            <img
              src={TokenImage}
              alt="Token"
              style={{
                width: screenWidth > 900 ? 60 : 40,
                height: screenWidth > 900 ? 60 : 40,
              }}
            />
            <div
              style={{
                fontSize: screenWidth > 900 ? 18 : 14,
                fontWeight: 700,
                color: "#d946ef",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {tokenCount}x
              <br />
              TOKENS
            </div>
          </div> */}
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
          {isLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                color: "white",
                gap: "15px",
              }}
            >
              {/* Spinning brain / circle */}
              <div
                style={{
                  width: 50,
                  height: 50,
                  border: "4px solid rgba(255, 255, 255, 0.2)",
                  borderTopColor: "#8b5cf6", // purple highlight
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginTop: 100,
                }}
              ></div>

              {/* Loading text */}
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                  marginBottom: 100,
                }}
              >
                Redirecting you...
              </p>

              {/* Inline keyframes */}
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: screenWidth > 900 ? 20 : 10,
                width:
                  screenWidth > 900
                    ? "100%"
                    : screenWidth < 768
                    ? "100%"
                    : "80%",
                marginTop: 50,
                marginBottom: 50,
              }}
            >
              {/* 1 TOKEN Card */}
              <button
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
                disabled={isLoading}
                onClick={() => handleTokenCardClick(PRICES.one)}
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
              </button>

              {/* 6 TOKENS Card - MOST POPULAR */}
              <button
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
                disabled={isLoading}
                onClick={() => handleTokenCardClick(PRICES.six)}
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
              </button>

              {/* 12 TOKENS Card */}
              <button
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
                disabled={isLoading}
                onClick={() => handleTokenCardClick(PRICES.twelve)}
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
              </button>

              {/* 24 TOKENS Card - BEST VALUE */}
              <button
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
                disabled={isLoading}
                onClick={() => handleTokenCardClick(PRICES.twentyFour)}
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
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
