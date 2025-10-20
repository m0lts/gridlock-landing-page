import { useEffect, useMemo, useState } from "react";

export default function CheckoutBridge() {
  const [showFallback, setShowFallback] = useState(false);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const env = (params.get("env") || "prod").toLowerCase();
  const success = params.get("success") === "true";
  const token = params.get("token") || "";

  // gridlock-dev in dev, gridlock in prod
  const scheme = env === "dev" ? "gridlock-dev" : "gridlock";
  const deepLink = `${scheme}://close?success=${success}${token ? `&token=${encodeURIComponent(token)}` : ""}`;

  useEffect(() => {
    // Try to open the app
    window.location.href = deepLink;

    // If the app isn't installed or the deep link is blocked,
    // show fallback UI after ~1.5s
    const t = setTimeout(() => setShowFallback(true), 1500);
    return () => clearTimeout(t);
  }, [deepLink]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }}>
      {!showFallback ? (
        <p style={{ fontSize: 16, fontWeight: 600 }}>
          Finishing up… opening the Gridlock app.
        </p>
      ) : (
        <div style={{
          maxWidth: 520,
          width: "100%",
          background: "white",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 6px 24px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ marginTop: 0, marginBottom: 8, color: "#222" }}>Open Gridlock to Use Tokens</h1>
          <p style={{ marginTop: 0, color: "#666" }}>
            We tried to open the app automatically but it didn’t work.
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <a
              href={deepLink}
              style={{
                display: "inline-block",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #222",
                textDecoration: "none",
                color: "#222",
                fontWeight: 600
              }}
            >
              Open the app
            </a>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #222",
                textDecoration: "none",
                color: "#222",
                fontWeight: 600
              }}
            >
              Back to Home
            </a>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <p style={{ marginTop: 0 }}>
            Don’t have the app yet?
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href="https://apps.apple.com/app/id6736937071"
              style={{ textDecoration: "none" }}
            >
              <span style={{ padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: 8, display: "inline-block" }}>
                Get on iOS
              </span>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.gridlock.gridlock"
              style={{ textDecoration: "none" }}
            >
              <span style={{ padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: 8, display: "inline-block" }}>
                Get on Android
              </span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}