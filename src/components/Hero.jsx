import GridlockLogo from "../assets/logo-white.png";
import AppStoreButton from "../assets/app-store.svg";
import GooglePlayButton from "../assets/google-play.png";
import Positions from "../assets/positions.png";
import PhoneScreen from "../assets/league.png";
import Prizes from "../assets/prizes.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore, auth, WEB_ENV } from "../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";

export const Hero = () => {
  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // ADD state
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [adminEmail, setAdminEmail] = useState(null);

  // Track auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { uid: u.uid, email: u.email || undefined } : null);
      // If we were waiting to redirect after login, do it now
      if (u && pendingRedirect) {
        const url = new URL(pendingRedirect, window.location.origin);
        url.searchParams.set("userId", u.uid);
        window.location.href = url.toString();
      }
    });
    return () => unsub();
  }, [pendingRedirect]);

  // Handle email-link completion (when user clicks the magic link)
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const stored = window.localStorage.getItem("emailForSignIn");
      const email = stored || window.prompt("Enter your email to complete sign-in") || "";
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem("emailForSignIn");
          })
          .catch((e) => console.error("Email link sign-in failed", e));
      }
    }
  }, []);

  const handleFAQClick = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // Fetch admin email from Firestore metadata
  useEffect(() => {
    const fetchAdminEmail = async () => {
      try {
        const metadataRef = doc(firestore, "metadata", "admin");
        const docSnap = await getDoc(metadataRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAdminEmail(data.allowedEmail || null);
        }
      } catch (error) {
        console.error("Error fetching admin email:", error);
      }
    };
    fetchAdminEmail();
  }, []);

  const currentYear = new Date().getFullYear();
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === "/join") {
      const marketingRef = doc(firestore, `marketingData`, `${currentYear}`);
      getDoc(marketingRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            updateDoc(marketingRef, {
              usersVisited: increment(1),
            });
          } else {
            setDoc(marketingRef, {
              usersVisited: 1,
            });
          }
        })
        .catch((error) => {
          console.error("Error updating Firestore:", error);
        });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const drivers = [
    {
      firstName: "Max",
      secondName: "Verstappen",
      number: 1,
      image: "https://media.api-sports.io/formula-1/drivers/25.png",
      color: "#3671C6",
    },
    {
      firstName: "Charles",
      secondName: "Leclerc",
      number: 16,
      image: "https://media.api-sports.io/formula-1/drivers/34.png",
      color: "#E8022D",
    },
    {
      firstName: "Lando",
      secondName: "Norris",
      number: 4,
      image: "https://media.api-sports.io/formula-1/drivers/49.png",
      color: "#FF8001",
    },
    {
      firstName: "Oscar",
      secondName: "Piastri",
      number: 81,
      image: "https://media.api-sports.io/formula-1/drivers/97.png",
      color: "#FF8001",
    },
    {
      firstName: "George",
      secondName: "Russell",
      number: 63,
      image: "https://media.api-sports.io/formula-1/drivers/51.png",
      color: "#29F4D2",
    },
    {
      firstName: "Select",
      secondName: "DRIVER",
      number: "--",
      color: "#fff",
    },
    {
      firstName: "Select",
      secondName: "DRIVER",
      number: "--",
      color: "#fff",
    },
    {
      firstName: "Select",
      secondName: "DRIVER",
      number: "--",
      color: "#fff",
    },
    {
      firstName: "Select",
      secondName: "DRIVER",
      number: "--",
      color: "#fff",
    },
    {
      firstName: "Select",
      secondName: "DRIVER",
      number: "--",
      color: "#fff",
    },
  ];

  const faqs = [
    {
      question: "How does Gridlock work?",
      answer:
        "Gridlock allows you to predict race results, compete in leagues, and win prizes. Simply submit predictions for each race weekend and track your performance on the leaderboard.",
    },
    {
      question: "How to redeem my prize?",
      answer:
        "If you've won a prize, you'll receive an email with instructions on how to redeem it. Follow the steps in the email to claim your reward. Make sure to check your junk/spam folder.",
    },
    {
      question: "How to delete my account and all associated data?",
      answer:
        "You can delete your account in the account section of the app. If this fails, please contact support by emailing us at admin@f1gridlock.com. We'll assist you with the deletion process.",
    },
  ];

  const openAuthModal = (redirectTo) => {
    if (redirectTo) setPendingRedirect(redirectTo);
    setShowAuthModal(true);
  };
  
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setPendingRedirect(null);
    setEmailInput("");
  };
  
  const handleSendEmailLink = async () => {
    try {
      if (!emailInput) {
        alert("Please enter your email.");
        return;
      }
      await sendSignInLinkToEmail(auth, emailInput, {
        url: window.location.href,
        handleCodeInApp: true,
      });
      window.localStorage.setItem("emailForSignIn", emailInput);
      alert("Check your email for a sign-in link.");
    } catch (e) {
      console.error(e);
      alert("Failed to send sign-in link.");
    }
  };
  
  const handleSignOut = async () => {
    await signOut(auth);
  };
  

  const goToPurchase = () => {
    const target = "/payment";
  
    const env = WEB_ENV === "dev" ? "dev" : "prod";
  
    if (!user) {
      // Not signed in → open modal and remember redirect
      openAuthModal(`${target}?env=${env}`);
      return;
    }
  
    // Signed in → go straight there
    const url = new URL(target, window.location.origin);
    url.searchParams.set("env", env);
    url.searchParams.set("userId", user.uid);
  
    window.location.href = url.toString();
  };

  return (
    <section className="hero">
      <div className="hero-background" />
      <div
  style={{
    position: "absolute",
    top: 16,
    right: 16,
    display: "flex",
    gap: 12,
    zIndex: 50,
  }}
>
  {/* Sign In / Account */}
  {user ? (
    <button
      onClick={handleSignOut}
      style={{
        backgroundColor: "#e63946", // red
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 14px",
        fontWeight: 700,
        cursor: "pointer",
      }}
      title={user.email || user.uid}
    >
      SIGN OUT
    </button>
  ) : (
    <button
      onClick={() => openAuthModal()}
      style={{
        backgroundColor: "#e63946", // red
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 14px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      SIGN IN
    </button>
  )}

  {/* GridBrain Tokens */}
  <button
    onClick={goToPurchase}
    style={{
      backgroundColor: "#7c3aed", // purple
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "10px 14px",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    GRIDBRAIN TOKENS
  </button>

  {/* Admin Dashboard - Only for specific email from Firestore */}
  {user?.email && adminEmail && user.email === adminEmail && (
    <button
      onClick={() => navigate("/admin")}
      style={{
        backgroundColor: "#ff4757", // red
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 14px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      ADMIN
    </button>
  )}
</div>
      <header className="hero-logo">
        <img
          src={GridlockLogo}
          alt="Gridlock Logo"
          style={{ width: 150, height: 150 }}
        />
      </header>
      <div
        className="hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: screenWidth > 768 ? "repeat(2, 1fr)" : "",
          gridTemplateRows: screenWidth < 769 ? "repeat(2, 1fr)" : "",
        }}
      >
        <div
          className="hero-left"
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 2,
            gridRowStart: 1,
            gridRowEnd: 2,
          }}
        >
          <h1
            style={{
              marginTop: screenWidth > 900 ? 100 : 25,
              textTransform: "uppercase",
              fontSize: screenWidth > 400 ? 36 : 24,
              fontWeight: 700,
            }}
          >
            Predict Races, Compete, And Win Prizes.
          </h1>
          <p
            style={{
              marginTop: screenWidth < 400 ? 35 : 25,
              marginBottom: screenWidth < 400 ? 35 : 25,
            }}
          >
            Play with your friends in private leagues, compete against
            like-minded fans, or predict on a global scale. Everyone is in with
            a chance of winning weekly prizes on Gridlock.
          </p>
          <div
            className="hero-app-buttons"
            style={{ display: "flex", gap: screenWidth < 400 ? 10 : 20 }}
          >
            <a
              href="https://apps.apple.com/gb/app/gridlock-f1-predictions-app/id6736937071"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={AppStoreButton}
                alt="Download on the App Store"
                style={{
                  width:
                    screenWidth > 500 ? 150 : screenWidth > 350 ? 125 : 100,
                }}
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.gridlock.gridlock&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={GooglePlayButton}
                alt="Get it on Google Play"
                style={{
                  width:
                    screenWidth > 500 ? 165 : screenWidth > 350 ? 135 : 105,
                }}
              />
            </a>
          </div>
        </div>
        {screenWidth > 768 && (
          <div
            className="hero-right"
            style={{
              gridColumnStart: 2,
              gridColumnEnd: 3,
              gridRowStart: 1,
              gridRowEnd: 3,
            }}
          >
            <h2
              style={{
                textTransform: "uppercase",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              Who would be in your top 10?
            </h2>
            {drivers.map((driver, index) => (
              <div
                key={index}
                className="prediction-item"
                style={{
                  border: `1px solid ${driver.color}`,
                  backgroundColor: "black",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  minHeight: 55,
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginLeft: 15,
                    textAlign: "center",
                    width: 25,
                  }}
                >
                  {driver.number}
                </span>
                {driver.image && (
                  <img
                    src={driver.image}
                    alt={`${driver.lastName} Photo`}
                    className="photo"
                    style={{ width: 50, height: 50, justifySelf: "flex-end" }}
                  />
                )}
                <div
                  className="name"
                  style={{ display: "flex", gap: 5, alignItems: "flex-end" }}
                >
                  <span>{driver.firstName}</span>
                  <span
                    style={{ textTransform: "uppercase", fontWeight: "600" }}
                  >
                    {driver.secondName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <h2
            style={{
              marginTop: screenWidth > 900 ? 100 : screenWidth < 768 ? 175 : 25,
              textTransform: "uppercase",
              fontSize: screenWidth > 400 ? 36 : 24,
              fontWeight: 700,
              position: "relative",
            }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>FANTASY</span>
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5em",
                color: "red",
                zIndex: 2,
              }}
            >
              ❌
            </span>
          </h2>
          <p style={{ marginTop: 10, textAlign: "center", width: "70%" }}>
            Unlike traditional fantasy apps, Gridlock has no budget limits, no
            must-pick rules and no limitations. Just choose who you want, where
            you want them before qualifying starts.
          </p>
        </div>
      </div>
      {screenWidth < 768 ? (
        <div
          className="banner-section"
          style={{
            width: "100%",
            display: screenWidth < 768 ? "flex" : "grid",
            gridTemplateColumns: screenWidth > 1265 ? "40% 60%" : "50% 50%",
            marginTop: 50,
            flexDirection: "column",
          }}
        >
          <div
            className="text-side"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: screenWidth < 768 ? "80%" : "",
            }}
          >
            <h2
              style={{
                paddingLeft: screenWidth < 500 ? 50 : 100,
                marginTop: 25,
                marginBottom: 25,
                fontSize: screenWidth < 500 ? 24 : 36,
              }}
            >
              COMPETE GLOBALLY OR AGAINST FRIENDS
            </h2>
            <div
              className="parallelogram"
              style={{ width: screenWidth > 400 ? "100%" : "75%" }}
            >
              <p
                style={{
                  paddingLeft: screenWidth < 500 ? 50 : 100,
                  paddingTop: 20,
                  paddingBottom: 20,
                  paddingRight: 20,
                  fontSize: screenWidth < 500 ? 12 : 18,
                  fontWeight: 500,
                }}
              >
                Create and join private leagues - prove to your friends that you
                know the most.
              </p>
            </div>
          </div>
          <div
            className="image-side"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 25,
            }}
          >
            <img
              src={PhoneScreen}
              alt="Gridlock Screenshot"
              style={{
                width: screenWidth > 1050 ? 450 : screenWidth > 400 ? 350 : 250,
                height:
                  screenWidth > 1050 ? 450 : screenWidth > 400 ? 350 : 250,
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className="banner-section"
          style={{
            width: "100%",
            display: screenWidth < 768 ? "flex" : "grid",
            gridTemplateColumns: screenWidth > 1265 ? "40% 60%" : "50% 50%",
            marginTop: 50,
            flexDirection: "column",
          }}
        >
          <div
            className="image-side"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={PhoneScreen}
              alt="Gridlock Screenshot"
              style={{
                width: screenWidth < 1050 ? 350 : 450,
                height: screenWidth < 1050 ? 350 : 450,
              }}
            />
          </div>
          <div
            className="text-side"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: screenWidth < 768 ? "80%" : "",
            }}
          >
            <h2
              style={{
                paddingRight: 100,
                marginTop: 25,
                marginBottom: 25,
                fontSize: 36,
                textAlign: "right",
              }}
            >
              COMPETE GLOBALLY OR AGAINST FRIENDS
            </h2>
            <div className="parallelogram left">
              <p
                style={{
                  paddingLeft: 20,
                  paddingTop: 20,
                  paddingBottom: 20,
                  paddingRight: 100,
                  fontSize: 18,
                  fontWeight: 500,
                  textAlign: "right",
                }}
              >
                Create and join private leagues - prove to your friends that you
                know the most.
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        className="banner-section"
        style={{
          width: "100%",
          display: screenWidth < 768 ? "flex" : "grid",
          gridTemplateColumns: screenWidth > 1265 ? "60% 40%" : "50% 50%",
          marginTop: 100,
          marginBottom: 100,
          flexDirection: "column",
        }}
      >
        <div
          className="text-side"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: screenWidth < 768 ? "80%" : "",
          }}
        >
          <h2
            style={{
              paddingLeft: screenWidth < 500 ? 50 : 100,
              marginTop: 25,
              marginBottom: 25,
              fontSize: screenWidth < 500 ? 24 : 36,
            }}
          >
            PRIZES TO BE WON EACH RACE WEEKEND
          </h2>
          <div
            className="parallelogram"
            style={{ width: screenWidth > 400 ? "100%" : "75%" }}
          >
            <p
              style={{
                paddingLeft: screenWidth < 500 ? 50 : 100,
                paddingTop: 20,
                paddingBottom: 20,
                paddingRight: 20,
                fontSize: screenWidth < 500 ? 12 : 18,
                fontWeight: 500,
              }}
            >
              On some race weekends prizes will be up for grabs for the best
              prediction!
            </p>
          </div>
        </div>
        <div
          className="image-side"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={Prizes}
            alt="Prizes available"
            style={{
              width: screenWidth > 1050 ? 450 : screenWidth > 400 ? 350 : 250,
              height: screenWidth > 1050 ? 450 : screenWidth > 400 ? 350 : 250,
            }}
          />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: "white", textAlign: "center" }}>FAQs</h2>
        <div style={{ marginTop: 15, width: "50vw" }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                marginBottom: 15,
                width: "100%",
                border: "1px solid white",
                borderRadius: 15,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => handleFAQClick(index)}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "white",
                  textAlign: "left",
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 10,
                  outline: "none",
                  borderRadius: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "none",
                  border: "none",
                }}
              >
                {faq.question}
                <span style={{ fontSize: 16 }}>
                  {expandedFAQ === index ? "▲" : "▼"}
                </span>
              </button>
              {expandedFAQ === index && (
                <div
                  style={{
                    color: "white",
                    padding: 10,
                    borderRadius: 5,
                    minWidth: "100%",
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <footer
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
            <a href="https://app.termly.io/policy-viewer/policy.html?policyUUID=3c0c4470-16e7-44b1-8700-97ba61830c3e" style={{ color: "white" }}>
              Privacy Policy
            </a>
            <a href="https://app.termly.io/policy-viewer/policy.html?policyUUID=5ff14f74-440f-4efc-847c-ad668d378a47" style={{ color: "white" }}>
              Terms Of Use
            </a>
            <a href="/payment?userId=anonymous" style={{ color: "white" }}>
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
        <h4>&copy; {currentYear} Company 57 Limited. All rights reserved.</h4>
      </footer>
      {showAuthModal && (
  <div
    onClick={closeAuthModal}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 360,
        maxWidth: "90vw",
        background: "#0f0f10",
        color: "#fff",
        borderRadius: 12,
        border: "1px solid #333",
        padding: 20,
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Sign in</h3>
        <button
          onClick={closeAuthModal}
          style={{
            background: "transparent",
            color: "#aaa",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <p style={{ marginTop: 8, marginBottom: 16, color: "#bbb" }}>
        Sign in with your Gridlock email to manage and purchase GridBrain tokens.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          type="email"
          placeholder="Email for sign-in link"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          style={{
            flex: 1,
            borderRadius: 8,
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
            padding: "10px 12px",
            outline: "none",
          }}
        />
        <button
          onClick={handleSendEmailLink}
          style={{
            backgroundColor: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 12px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Email link
        </button>
      </div>

      {pendingRedirect && (
        <div style={{ marginTop: 8, color: "#8dd58d", fontSize: 12 }}>
          You’ll be redirected after sign-in…
        </div>
      )}
    </div>
  </div>
)}
    </section>
  );
};
