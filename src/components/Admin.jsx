import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore, PROJECT_ID } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { hashString } from "../utils/hash";
import { fetchF1Data } from "../services/f1Api";
import {
  filterEventResponse,
  filterDriverResponse,
  filterNextEvent,
  filterPreviousEvent,
  filterLiveEvent,
  filterUpcomingEvents,
  filterPreviousEvents,
  getRoundNumber,
} from "../services/f1DataProcessor";
import GridlockLogo from "../assets/logo-white.png";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminCredentials, setAdminCredentials] = useState(null);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  
  // F1 Data state
  const [f1Data, setF1Data] = useState({
    events: [],
    drivers: [],
    nextEvent: null,
    previousEvent: null,
    liveEvent: null,
    upcomingEvents: [],
    previousEvents: [],
    roundNumber: null,
    seasonYear: new Date().getFullYear(),
    loading: true,
    error: null,
  });
  
  // Firestore next event for comparison
  const [firestoreNextEvent, setFirestoreNextEvent] = useState(null);
  const [isEditingDatabase, setIsEditingDatabase] = useState(false);
  const [editedSessions, setEditedSessions] = useState([]);
  const [savingDatabase, setSavingDatabase] = useState(false);
  const [useDatabaseData, setUseDatabaseData] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState({}); // Object with eventId as key
  const [expandedDiagnostics, setExpandedDiagnostics] = useState(new Set());
  const [bugReports, setBugReports] = useState([]);
  const [selectedBugReport, setSelectedBugReport] = useState(null);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [feedbackReports, setFeedbackReports] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [runningReport, setRunningReport] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [runningRecalculation, setRunningRecalculation] = useState(false);
  const [recalculationResult, setRecalculationResult] = useState(null);
  const [updatingStandings, setUpdatingStandings] = useState(false);
  const [standingsUpdateResult, setStandingsUpdateResult] = useState(null);
  const [preparingSeason, setPreparingSeason] = useState(false);
  const [seasonPrepResult, setSeasonPrepResult] = useState(null);
  const [showSeasonPrepConfirm, setShowSeasonPrepConfirm] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [savingNotification, setSavingNotification] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editingPageKey, setEditingPageKey] = useState(null);
  
  // App lockdown state (show_maintenance in metadata/diagnostics)
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [loadingLockdown, setLoadingLockdown] = useState(true);
  const [savingLockdown, setSavingLockdown] = useState(false);

  // Fetch admin credentials from Firestore metadata collection
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const metadataRef = doc(firestore, "metadata", "admin");
        const docSnap = await getDoc(metadataRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAdminCredentials({
            allowedEmail: data.allowedEmail || "",
            passwordHash: data.passwordHash || "",
          });
        } else {
          setError("Admin credentials not found in database");
        }
      } catch (err) {
        console.error("Error fetching admin credentials:", err);
        setError("Failed to load admin credentials");
      } finally {
        setLoadingCredentials(false);
      }
    };

    fetchCredentials();
  }, []);

  // Check Firebase auth on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  // Check if password is already authenticated (stored in session)
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_password_auth");
    if (stored === "true" && adminCredentials) {
      setIsPasswordAuthenticated(true);
    }
  }, [adminCredentials]);

  // Verify email matches allowed email from Firestore
  useEffect(() => {
    if (user && adminCredentials && !checkingAuth && !loadingCredentials) {
      if (user.email !== adminCredentials.allowedEmail) {
        navigate("/");
      }
    }
  }, [user, adminCredentials, checkingAuth, loadingCredentials, navigate]);

  const handlePasswordSubmit = async () => {
    if (!adminCredentials) {
      setError("Credentials not loaded");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    try {
      // Hash the input password
      const inputHash = await hashString(password);
      
      // Compare with stored hash
      if (inputHash === adminCredentials.passwordHash) {
        setIsPasswordAuthenticated(true);
        sessionStorage.setItem("admin_password_auth", "true");
        setError("");
        setPassword("");
      } else {
        setError("Incorrect password");
        setPassword("");
      }
    } catch (err) {
      console.error("Error hashing password:", err);
      setError("Authentication error. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsPasswordAuthenticated(false);
    sessionStorage.removeItem("admin_password_auth");
    navigate("/");
  };

  const handleStartEdit = () => {
    if (firestoreNextEvent && firestoreNextEvent.events) {
      // Create editable copies of the sessions
      const editableSessions = firestoreNextEvent.events.map(session => ({
        ...session,
        date: new Date(session.date).toISOString().slice(0, 16), // Format for datetime-local input
      }));
      setEditedSessions(editableSessions);
      setIsEditingDatabase(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingDatabase(false);
    setEditedSessions([]);
  };

  const handleSessionTimeChange = (sessionType, newDateTime) => {
    const updatedSessions = editedSessions.map(session => 
      session.type === sessionType
        ? { ...session, date: newDateTime }
        : session
    );
    setEditedSessions(updatedSessions);
  };

  const handleSaveDatabase = async () => {
    if (!firestoreNextEvent || !f1Data.seasonYear) return;

    setSavingDatabase(true);
    try {
      // Get all events from Firestore
      const eventsDocRef = doc(firestore, `data_${f1Data.seasonYear}`, "events");
      const eventsDoc = await getDoc(eventsDocRef);
      
      if (!eventsDoc.exists()) {
        throw new Error("Events document not found");
      }

      const allEvents = eventsDoc.data().events;
      
      // Find the index of the event we're editing
      const eventIndex = allEvents.findIndex(
        (event) => 
          event.id === firestoreNextEvent.id || 
          event.name === firestoreNextEvent.name ||
          event.circuitName === firestoreNextEvent.circuitName
      );

      if (eventIndex === -1) {
        throw new Error("Event not found in database");
      }

      // Update the events array with the edited sessions
      const updatedEvent = {
        ...allEvents[eventIndex],
        events: editedSessions.map(session => ({
          ...session,
          date: new Date(session.date).toISOString(), // Convert back to ISO string
        })),
      };

      allEvents[eventIndex] = updatedEvent;

      // Save to Firestore
      await updateDoc(eventsDocRef, {
        events: allEvents,
      });

      // Update local state
      setFirestoreNextEvent(updatedEvent);
      setIsEditingDatabase(false);
      setEditedSessions([]);
      
      alert("Database updated successfully!");
    } catch (error) {
      console.error("Error saving to database:", error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setSavingDatabase(false);
    }
  };

  // Check if session times actually match
  const checkSessionsMatch = () => {
    if (!f1Data.nextEvent || !firestoreNextEvent) return false;
    if (!f1Data.nextEvent.events || !firestoreNextEvent.events) return false;
    if (f1Data.nextEvent.events.length !== firestoreNextEvent.events.length) return false;

    // Sort both arrays by type for comparison
    const apiSessions = [...f1Data.nextEvent.events].sort((a, b) => a.type.localeCompare(b.type));
    const dbSessions = [...firestoreNextEvent.events].sort((a, b) => a.type.localeCompare(b.type));

    // Check if all sessions match (same type and same time)
    return apiSessions.every((apiSession, idx) => {
      const dbSession = dbSessions[idx];
      if (apiSession.type !== dbSession.type) return false;
      // Compare times (allow 1 minute difference for rounding)
      const timeDiff = Math.abs(new Date(apiSession.date).getTime() - new Date(dbSession.date).getTime());
      return timeDiff < 60000; // 1 minute tolerance
    });
  };

  const handleToggleUseDatabaseData = async () => {
    try {
      const adminMetadataRef = doc(firestore, "metadata", "admin");
      const newValue = !useDatabaseData;
      await updateDoc(adminMetadataRef, {
        useDatabaseData: newValue,
      });
      setUseDatabaseData(newValue);
      alert(`Use Database Data set to ${newValue ? "true" : "false"}`);
    } catch (error) {
      console.error("Error updating useDatabaseData:", error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const toggleDiagnostics = (eventId) => {
    const newExpanded = new Set(expandedDiagnostics);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedDiagnostics(newExpanded);
  };

  // Notification handlers
  const handleToggleNotification = async (pageKey) => {
    if (!notifications) return;
    
    setSavingNotification(true);
    try {
      const notificationsRef = doc(firestore, "metadata", "notifications");
      const updatedNotifications = {
        ...notifications,
        [pageKey]: {
          ...notifications[pageKey],
          active: !notifications[pageKey].active,
        },
      };
      
      await updateDoc(notificationsRef, {
        [pageKey]: updatedNotifications[pageKey],
      });
      
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error toggling notification:", error);
      alert(`Failed to update notification: ${error.message}`);
    } finally {
      setSavingNotification(false);
    }
  };

  const handleSaveNotification = async (pageKey) => {
    if (!notifications || !editingNotification) return;
    
    setSavingNotification(true);
    try {
      const notificationsRef = doc(firestore, "metadata", "notifications");
      const updatedNotifications = {
        ...notifications,
        [pageKey]: editingNotification,
      };
      
      await updateDoc(notificationsRef, {
        [pageKey]: editingNotification,
      });
      
      setNotifications(updatedNotifications);
      setEditingNotification(null);
      setEditingPageKey(null);
      alert("Notification updated successfully!");
    } catch (error) {
      console.error("Error saving notification:", error);
      alert(`Failed to save notification: ${error.message}`);
    } finally {
      setSavingNotification(false);
    }
  };

  const handleStartEditNotification = (pageKey) => {
    if (!notifications) return;
    setEditingNotification({ ...notifications[pageKey] });
    setEditingPageKey(pageKey);
  };

  const handleCancelEditNotification = () => {
    setEditingNotification(null);
    setEditingPageKey(null);
  };

  // App lockdown handler (show_maintenance in metadata/diagnostics)
  const handleToggleAppLockdown = async () => {
    setSavingLockdown(true);
    try {
      const diagnosticsRef = doc(firestore, "metadata", "diagnostics");
      const newValue = !showMaintenance;
      
      await updateDoc(diagnosticsRef, {
        show_maintenance: newValue,
      });
      
      setShowMaintenance(newValue);
      alert(`Maintenance mode ${newValue ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error toggling app lockdown:", error);
      alert(`Failed to update maintenance mode: ${error.message}`);
    } finally {
      setSavingLockdown(false);
    }
  };

  const handleBugReportClick = (report) => {
    setSelectedBugReport(report);
    setShowBugReportModal(true);
    
    // Mark as seen if not already seen
    if (!report.seen) {
      handleMarkBugReportSeen(report.id, true);
    }
  };

  const handleMarkBugReportSeen = async (reportId, seen) => {
    try {
      const reportRef = doc(firestore, `bug_reports_${f1Data.seasonYear}`, reportId);
      await updateDoc(reportRef, { seen });
      
      // Update local state
      setBugReports(prev => prev.map(r => r.id === reportId ? { ...r, seen } : r));
      if (selectedBugReport && selectedBugReport.id === reportId) {
        setSelectedBugReport(prev => ({ ...prev, seen }));
      }
    } catch (error) {
      console.error("Error updating bug report seen status:", error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const handleDeleteBugReport = async (reportId) => {
    if (!confirm("Are you sure you want to delete this bug report?")) return;
    
    try {
      const reportRef = doc(firestore, `bug_reports_${f1Data.seasonYear}`, reportId);
      await deleteDoc(reportRef);
      
      // Update local state
      setBugReports(prev => prev.filter(r => r.id !== reportId));
      setShowBugReportModal(false);
      setSelectedBugReport(null);
      alert("Bug report deleted successfully");
    } catch (error) {
      console.error("Error deleting bug report:", error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const handleReplyToBugReport = (report) => {
    const subject = encodeURIComponent(`Re: Gridlock Bug Report`);
    const body = encodeURIComponent(`Hi,\n\nThank you for your bug report.\n\nOriginal report:\n${report?.report}\n\n`);
    window.location.href = `mailto:${report.email}?subject=${subject}&body=${body}`;
  };

  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackModal(true);
    
    // Mark as seen if not already seen
    if (!feedback.seen) {
      handleMarkFeedbackSeen(feedback.id, true);
    }
  };

  const handleMarkFeedbackSeen = async (feedbackId, seen) => {
    try {
      const feedbackRef = doc(firestore, `feedback_${f1Data.seasonYear}`, feedbackId);
      await updateDoc(feedbackRef, { seen });
      
      // Update local state
      setFeedbackReports(prev => prev.map(f => f.id === feedbackId ? { ...f, seen } : f));
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback(prev => ({ ...prev, seen }));
      }
    } catch (error) {
      console.error("Error updating feedback seen status:", error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      const feedbackRef = doc(firestore, `feedback_${f1Data.seasonYear}`, feedbackId);
      await deleteDoc(feedbackRef);
      
      // Update local state
      setFeedbackReports(prev => prev.filter(f => f.id !== feedbackId));
      setShowFeedbackModal(false);
      setSelectedFeedback(null);
      alert("Feedback deleted successfully");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const handleReplyToFeedback = (feedback) => {
    const subject = encodeURIComponent(`Re: Gridlock Feedback`);
    const body = encodeURIComponent(`Hi,\n\nThank you for your feedback.\n\nOriginal feedback:\n${feedback?.feedback}\n\n`);
    window.location.href = `mailto:${feedback.email}?subject=${subject}&body=${body}`;
  };

  const handleRunReport = async () => {
    if (!selectedRaceId) {
      alert("Please select a race first");
      return;
    }

    const apiKey = import.meta.env.VITE_GRIDLOCK_API;
    if (!apiKey) {
      alert("VITE_GRIDLOCK_API not found in environment variables");
      return;
    }

    setRunningReport(true);
    setReportResult(null);

    try {
      const url = new URL("https://europe-west2-gridlock-3a102.cloudfunctions.net/generateWeekendReport");
      url.searchParams.append("raceId", selectedRaceId);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "gridlock_api": apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate report: ${response.status} ${errorText}`);
      }

      const result = await response.text();
      setReportResult(result);
    } catch (error) {
      console.error("Error running report:", error);
      alert(`Failed to run report: ${error.message}`);
      setReportResult(null);
    } finally {
      setRunningReport(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedRaceId) {
      alert("Please select a race first");
      return;
    }

    const apiKey = import.meta.env.VITE_GRIDLOCK_API;
    if (!apiKey) {
      alert("VITE_GRIDLOCK_API not found in environment variables");
      return;
    }

    setRunningAnalysis(true);
    setAnalysisResult(null);

    try {
      const url = new URL("https://analysemodelperformance-wgstcuv22a-nw.a.run.app/");
      url.searchParams.append("raceId", selectedRaceId);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "gridlock_api": apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to run analysis: ${response.status} ${errorText}`);
      }

      const result = await response.text();
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error running analysis:", error);
      alert(`Failed to run analysis: ${error.message}`);
      setAnalysisResult(null);
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleRecalculatePoints = async () => {
    const apiKey = import.meta.env.VITE_GRIDLOCK_API;
    if (!apiKey) {
      alert("VITE_GRIDLOCK_API not found in environment variables");
      return;
    }

    setRunningRecalculation(true);
    setRecalculationResult(null);

    try {
      const body = {};
      // If a race is selected, include competitionId in the body
      if (selectedRaceId) {
        body.competitionId = selectedRaceId;
      }

      const response = await fetch("https://invokepointsrecalculation-wgstcuv22a-nw.a.run.app/", {
        method: "POST",
        headers: {
          "gridlock_api": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to recalculate points: ${response.status} ${errorText}`);
      }

      const result = await response.text();
      setRecalculationResult(result);
    } catch (error) {
      console.error("Error recalculating points:", error);
      alert(`Failed to recalculate points: ${error.message}`);
      setRecalculationResult(null);
    } finally {
      setRunningRecalculation(false);
    }
  };

  const handleUpdateGlobalStandings = async () => {
    if (!f1Data.previousEvent || !f1Data.previousEvent.id) {
      alert("No previous event found. Please wait for F1 data to load.");
      return;
    }

    setUpdatingStandings(true);
    setStandingsUpdateResult(null);

    try {
      const currentYear = f1Data.seasonYear || new Date().getFullYear();
      const competitionId = String(f1Data.previousEvent.id);
      const serviceRef = doc(firestore, `services_${currentYear}`, competitionId);

      // First, set pointsCalculated to false
      await updateDoc(serviceRef, {
        pointsCalculated: false,
      });

      // Small delay to ensure the update is processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Then, set pointsCalculated to true (this triggers the cloud function)
      await updateDoc(serviceRef, {
        pointsCalculated: true,
      });

      setStandingsUpdateResult(`Successfully updated pointsCalculated for event ${f1Data.previousEvent.name} (ID: ${competitionId}). The cloud function should now trigger to update global standings.`);
    } catch (error) {
      console.error("Error updating global standings:", error);
      const errorMessage = error.message || "Unknown error occurred";
      setStandingsUpdateResult(`Error: ${errorMessage}`);
      alert(`Failed to update global standings: ${errorMessage}`);
    } finally {
      setUpdatingStandings(false);
    }
  };

  const handlePrepareForNewSeason = async () => {
    const apiKey = import.meta.env.VITE_GRIDLOCK_API;
    if (!apiKey) {
      alert("VITE_GRIDLOCK_API not found in environment variables");
      return;
    }

    setPreparingSeason(true);
    setSeasonPrepResult(null);
    setShowSeasonPrepConfirm(false);

    try {
      const response = await fetch("https://preparefornewseason-wgstcuv22a-nw.a.run.app/", {
        method: "POST",
        headers: {
          "gridlock_api": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to prepare for new season: ${response.status} ${errorText}`);
      }

      const result = await response.text();
      setSeasonPrepResult(result);
    } catch (error) {
      console.error("Error preparing for new season:", error);
      const errorMessage = error.message || "Unknown error occurred";
      setSeasonPrepResult(`Error: ${errorMessage}`);
      alert(`Failed to prepare for new season: ${errorMessage}`);
    } finally {
      setPreparingSeason(false);
    }
  };

  const renderDiagnosticsForEvent = (eventId, eventName, diagnostics) => {
    const isExpanded = expandedDiagnostics.has(eventId);
    const isNextEvent = f1Data.nextEvent && f1Data.nextEvent.id === eventId;
    
    return (
      <div key={eventId} style={{ marginBottom: 15, border: "1px solid #444", borderRadius: 8, overflow: "hidden" }}>
        <button
          onClick={() => toggleDiagnostics(eventId)}
          style={{
            width: "100%",
            padding: "12px 15px",
            backgroundColor: isNextEvent ? "#2a2a2a" : "#1a1a1a",
            border: "none",
            borderBottom: isExpanded ? "1px solid #444" : "none",
            color: "#fff",
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isNextEvent ? "#29F4D2" : "#fff" }}>
              {eventName}
              {isNextEvent && <span style={{ marginLeft: 8, color: "#7c3aed", fontSize: 11 }}>(Next Event)</span>}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#888" }}>
              {diagnostics.pointsCalculated ? "✓ Points Calculated" : "✗ Points Not Calculated"}
              {diagnostics.globalStandingsComplete !== undefined && (
                <span style={{ marginLeft: 10 }}>
                  {diagnostics.globalStandingsComplete ? "✓ Standings Complete" : "✗ Standings Incomplete"}
                </span>
              )}
            </p>
          </div>
          <span style={{ fontSize: 18, color: "#888" }}>{isExpanded ? "▼" : "▶"}</span>
        </button>
        
        {isExpanded && (
          <div style={{ padding: 15, backgroundColor: "#1a1a1a" }}>
            {/* Points Calculation */}
            <div style={{ marginBottom: 15, paddingBottom: 15, borderBottom: "1px solid #444" }}>
              <h4 style={{ margin: "0 0 10px", color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                POINTS CALCULATION
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888", fontSize: 11 }}>Calculated:</span>
                  <span style={{ color: diagnostics.pointsCalculated ? "#29F4D2" : "#ff4757", fontSize: 11, fontWeight: 600 }}>
                    {diagnostics.pointsCalculated ? "✓ Yes" : "✗ No"}
                  </span>
                </div>
                {diagnostics.pointsCalculationInProgress !== undefined && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#888", fontSize: 11 }}>In Progress:</span>
                    <span style={{ color: diagnostics.pointsCalculationInProgress ? "#ff4757" : "#29F4D2", fontSize: 11 }}>
                      {diagnostics.pointsCalculationInProgress ? "Yes" : "No"}
                    </span>
                  </div>
                )}
                {diagnostics.pointsCalculationTotalUsersProcessed !== undefined && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#888", fontSize: 11 }}>Users Processed:</span>
                    <span style={{ color: "#fff", fontSize: 11, fontFamily: "monospace" }}>
                      {diagnostics.pointsCalculationTotalUsersProcessed.toLocaleString()}
                    </span>
                  </div>
                )}
                {diagnostics.pointsCalculationLastProcessedTime && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#888", fontSize: 11 }}>Last Processed:</span>
                    <span style={{ color: "#888", fontSize: 10, fontFamily: "monospace" }}>
                      {new Date(diagnostics.pointsCalculationLastProcessedTime).toLocaleString('en-GB')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Global Standings */}
            {diagnostics.globalStandingsComplete !== undefined && (
              <div style={{ marginBottom: 15, paddingBottom: 15, borderBottom: "1px solid #444" }}>
                <h4 style={{ margin: "0 0 10px", color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                  GLOBAL STANDINGS
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#888", fontSize: 11 }}>Complete:</span>
                    <span style={{ color: diagnostics.globalStandingsComplete ? "#29F4D2" : "#ff4757", fontSize: 11, fontWeight: 600 }}>
                      {diagnostics.globalStandingsComplete ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  {diagnostics.globalStandingsProcessed !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888", fontSize: 11 }}>Processed:</span>
                      <span style={{ color: "#fff", fontSize: 11, fontFamily: "monospace" }}>
                        {diagnostics.globalStandingsProcessed.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {diagnostics.globalStandingsLastUpdated && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888", fontSize: 11 }}>Last Updated:</span>
                      <span style={{ color: "#888", fontSize: 10, fontFamily: "monospace" }}>
                        {new Date(diagnostics.globalStandingsLastUpdated).toLocaleString('en-GB')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leagues Processing */}
            {diagnostics.leagues && (
              <div style={{ marginBottom: 15 }}>
                <h4 style={{ margin: "0 0 10px", color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                  LEAGUES PROCESSING
                </h4>
                
                {/* Private Leagues */}
                {diagnostics.leagues.private && (
                  <div style={{ marginBottom: 10, padding: 10, backgroundColor: "#2a2a2a", borderRadius: 6 }}>
                    <p style={{ margin: "0 0 8px", color: "#fff", fontSize: 11, fontWeight: 600 }}>Private</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {diagnostics.leagues.private.total !== undefined && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#888", fontSize: 10 }}>Total:</span>
                          <span style={{ color: "#fff", fontSize: 10, fontFamily: "monospace" }}>
                            {diagnostics.leagues.private.total}
                          </span>
                        </div>
                      )}
                      {diagnostics.leagues.private.completed && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#888", fontSize: 10 }}>Completed Pages:</span>
                            <span style={{ color: "#29F4D2", fontSize: 10, fontFamily: "monospace" }}>
                              {diagnostics.leagues.private.completed.pages || 0}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#888", fontSize: 10 }}>Completed Users:</span>
                            <span style={{ color: "#29F4D2", fontSize: 10, fontFamily: "monospace" }}>
                              {diagnostics.leagues.private.completed.users || 0}
                            </span>
                          </div>
                        </>
                      )}
                      {diagnostics.leagues.private.failed && (
                        <>
                          {(diagnostics.leagues.private.failed.pages || 0) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#888", fontSize: 10 }}>Failed Pages:</span>
                              <span style={{ color: "#ff4757", fontSize: 10, fontFamily: "monospace" }}>
                                {diagnostics.leagues.private.failed.pages}
                              </span>
                            </div>
                          )}
                          {(diagnostics.leagues.private.failed.users || 0) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#888", fontSize: 10 }}>Failed Users:</span>
                              <span style={{ color: "#ff4757", fontSize: 10, fontFamily: "monospace" }}>
                                {diagnostics.leagues.private.failed.users}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {diagnostics.leagues.private.processing && (
                        <>
                          {(diagnostics.leagues.private.processing.pages || 0) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#888", fontSize: 10 }}>Processing Pages:</span>
                              <span style={{ color: "#ffd700", fontSize: 10, fontFamily: "monospace" }}>
                                {diagnostics.leagues.private.processing.pages}
                              </span>
                            </div>
                          )}
                          {(diagnostics.leagues.private.processing.users || 0) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#888", fontSize: 10 }}>Processing Users:</span>
                              <span style={{ color: "#ffd700", fontSize: 10, fontFamily: "monospace" }}>
                                {diagnostics.leagues.private.processing.users}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {diagnostics.leagues.private.failedProcessing !== undefined && diagnostics.leagues.private.failedProcessing > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#888", fontSize: 10 }}>Failed Processing:</span>
                          <span style={{ color: "#ff4757", fontSize: 10, fontFamily: "monospace" }}>
                            {diagnostics.leagues.private.failedProcessing}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Public Leagues */}
                {diagnostics.leagues.public && (
                  <div style={{ padding: 10, backgroundColor: "#2a2a2a", borderRadius: 6 }}>
                    <p style={{ margin: "0 0 8px", color: "#fff", fontSize: 11, fontWeight: 600 }}>Public</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {diagnostics.leagues.public.total !== undefined && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#888", fontSize: 10 }}>Total:</span>
                          <span style={{ color: "#fff", fontSize: 10, fontFamily: "monospace" }}>
                            {diagnostics.leagues.public.total}
                          </span>
                        </div>
                      )}
                      {diagnostics.leagues.public.completed && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#888", fontSize: 10 }}>Completed Pages:</span>
                            <span style={{ color: "#29F4D2", fontSize: 10, fontFamily: "monospace" }}>
                              {diagnostics.leagues.public.completed.pages || 0}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#888", fontSize: 10 }}>Completed Users:</span>
                            <span style={{ color: "#29F4D2", fontSize: 10, fontFamily: "monospace" }}>
                              {diagnostics.leagues.public.completed.users || 0}
                            </span>
                          </div>
                        </>
                      )}
                      {diagnostics.leagues.public.failed && (
                        <>
                          {(diagnostics.leagues.public.failed.pages || 0) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#888", fontSize: 10 }}>Failed Pages:</span>
                              <span style={{ color: "#ff4757", fontSize: 10, fontFamily: "monospace" }}>
                                {diagnostics.leagues.public.failed.pages}
                              </span>
                            </div>
                          )}
                          {(diagnostics.leagues.public.failed.users || 0) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#888", fontSize: 10 }}>Failed Users:</span>
                              <span style={{ color: "#ff4757", fontSize: 10, fontFamily: "monospace" }}>
                                {diagnostics.leagues.public.failed.users}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {diagnostics.leagues.public.processing && (
                        <>
                          {(diagnostics.leagues.public.processing.pages || 0) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#888", fontSize: 10 }}>Processing Pages:</span>
                              <span style={{ color: "#ffd700", fontSize: 10, fontFamily: "monospace" }}>
                                {diagnostics.leagues.public.processing.pages}
                              </span>
                            </div>
                          )}
                          {(diagnostics.leagues.public.processing.users || 0) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#888", fontSize: 10 }}>Processing Users:</span>
                              <span style={{ color: "#ffd700", fontSize: 10, fontFamily: "monospace" }}>
                                {diagnostics.leagues.public.processing.users}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {diagnostics.leagues.public.failedProcessing !== undefined && diagnostics.leagues.public.failedProcessing > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#888", fontSize: 10 }}>Failed Processing:</span>
                          <span style={{ color: "#ff4757", fontSize: 10, fontFamily: "monospace" }}>
                            {diagnostics.leagues.public.failedProcessing}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other Info */}
            <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid #444" }}>
              {diagnostics.eventsUpdated !== undefined && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "#888", fontSize: 11 }}>Events Updated:</span>
                  <span style={{ color: diagnostics.eventsUpdated ? "#29F4D2" : "#ff4757", fontSize: 11 }}>
                    {diagnostics.eventsUpdated ? "✓ Yes" : "✗ No"}
                  </span>
                </div>
              )}
              {diagnostics.postRaceStartPredictions !== undefined && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "#888", fontSize: 11 }}>Post-Race Predictions:</span>
                  <span style={{ color: diagnostics.postRaceStartPredictions ? "#29F4D2" : "#ff4757", fontSize: 11 }}>
                    {diagnostics.postRaceStartPredictions ? "✓ Yes" : "✗ No"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Fetch F1 data when authenticated
  useEffect(() => {
    if (!isPasswordAuthenticated) return;

    const fetchF1DataForAdmin = async () => {
      setF1Data(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const currentYear = new Date().getFullYear();
        
        // Get image metadata from Firestore
        const metadataRef = doc(firestore, "metadata", "images");
        const metadataSnap = await getDoc(metadataRef);
        const imageData = metadataSnap.exists() ? metadataSnap.data() : {};
        const circuitOutlineMap = imageData.circuitOutlines || {};
        const driverPhotoMap = imageData.driverPhotos || {};
        const teamBadgeMap = imageData.teamBadges || {};

        // Fetch events
        let filteredEvents = [];
        try {
          const eventData = await fetchF1Data(
            `races?season=${currentYear}&timezone=Europe/London`
          );
          
          if (eventData.response && eventData.response.length > 0) {
            filteredEvents = filterEventResponse(eventData.response, circuitOutlineMap);
          } else {
            // Fallback to Firestore
            const eventsDocRef = doc(firestore, `data_${currentYear}`, "events");
            const eventsDoc = await getDoc(eventsDocRef);
            if (eventsDoc.exists()) {
              filteredEvents = eventsDoc.data().events;
            }
          }
        } catch (err) {
          console.error("Error fetching events:", err);
          // Try Firestore fallback
          const eventsDocRef = doc(firestore, `data_${currentYear}`, "events");
          const eventsDoc = await getDoc(eventsDocRef);
          if (eventsDoc.exists()) {
            filteredEvents = eventsDoc.data().events;
          }
        }

        // Fetch drivers
        let filteredDrivers = [];
        try {
          const driverData = await fetchF1Data(`rankings/drivers?season=${currentYear}`);
          
          if (driverData.response && driverData.response.length > 0) {
            filteredDrivers = filterDriverResponse(
              driverData.response,
              driverPhotoMap,
              teamBadgeMap
            );
          } else {
            // Fallback to Firestore
            const driversDocRef = doc(firestore, `data_${currentYear}`, "drivers");
            const driversDoc = await getDoc(driversDocRef);
            if (driversDoc.exists()) {
              filteredDrivers = driversDoc.data().drivers;
            }
          }
        } catch (err) {
          console.error("Error fetching drivers:", err);
          // Try Firestore fallback
          const driversDocRef = doc(firestore, `data_${currentYear}`, "drivers");
          const driversDoc = await getDoc(driversDocRef);
          if (driversDoc.exists()) {
            filteredDrivers = driversDoc.data().drivers;
          }
        }

        // Process the data
        const nextEvent = filterNextEvent(filteredEvents);
        const previousEvent = filterPreviousEvent(filteredEvents);
        const liveEvent = filterLiveEvent(filteredEvents);
        const upcomingEvents = filterUpcomingEvents(filteredEvents);
        const previousEvents = filterPreviousEvents(filteredEvents);
        const roundNumber = getRoundNumber(filteredEvents);

        setF1Data({
          events: filteredEvents,
          drivers: filteredDrivers,
          nextEvent,
          previousEvent,
          liveEvent,
          upcomingEvents,
          previousEvents,
          roundNumber,
          seasonYear: currentYear,
          loading: false,
          error: null,
        });

        // Also fetch Firestore events for comparison - match by event ID or name
        try {
          const eventsDocRef = doc(firestore, `data_${currentYear}`, "events");
          const eventsDoc = await getDoc(eventsDocRef);
          if (eventsDoc.exists() && nextEvent) {
            const firestoreEvents = eventsDoc.data().events;
            // Find the matching event from Firestore by ID or name
            const matchingFirestoreEvent = firestoreEvents.find(
              (event) => 
                event.id === nextEvent.id || 
                event.name === nextEvent.name ||
                event.circuitName === nextEvent.circuitName
            );
            setFirestoreNextEvent(matchingFirestoreEvent || null);
          } else {
            setFirestoreNextEvent(null);
          }
          
          // Fetch useDatabaseData setting
          const adminMetadataRef = doc(firestore, "metadata", "admin");
          const adminMetadataDoc = await getDoc(adminMetadataRef);
          if (adminMetadataDoc.exists()) {
            setUseDatabaseData(adminMetadataDoc.data().useDatabaseData || false);
          }
        } catch (err) {
          console.error("Error fetching Firestore events for comparison:", err);
          setFirestoreNextEvent(null);
        }
        
        // Fetch diagnostics data for all events
        try {
          const servicesCollectionRef = collection(firestore, `services_${currentYear}`);
          const servicesSnapshot = await getDocs(servicesCollectionRef);
          
          // Build a map of eventId -> diagnostics data
          const diagnosticsMap = {};
          
          
          servicesSnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            // Check if it has the leagues field (new structure)
            if (data.leagues) {
              const eventId = docSnapshot.id || data.eventId;
              if (eventId) {
                diagnosticsMap[eventId] = {
                  id: docSnapshot.id,
                  eventId: eventId,
                  ...data,
                };
              }
            }
          });
                    setDiagnosticsData(diagnosticsMap);
          
          // Auto-expand the next event's diagnostics
          if (nextEvent && diagnosticsMap[nextEvent.id]) {
            setExpandedDiagnostics(new Set([nextEvent.id]));
          }
        } catch (err) {
          console.error("Error fetching diagnostics:", err);
          setDiagnosticsData({});
        }
        
        // Fetch bug reports
        try {
          const bugReportsCollectionRef = collection(firestore, `bug_reports_${currentYear}`);
          const bugReportsQuery = query(bugReportsCollectionRef, orderBy("timestamp", "desc"));
          const bugReportsSnapshot = await getDocs(bugReportsQuery);
          
          const reports = [];
          bugReportsSnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            reports.push({
              id: docSnapshot.id,
              ...data,
            });
          });
          
          setBugReports(reports);
        } catch (err) {
          console.error("Error fetching bug reports:", err);
          setBugReports([]);
        }
        
        // Fetch feedback reports
        try {
          const feedbackCollectionRef = collection(firestore, `feedback_${currentYear}`);
          const feedbackQuery = query(feedbackCollectionRef, orderBy("timestamp", "desc"));
          const feedbackSnapshot = await getDocs(feedbackQuery);
          
          const feedbacks = [];
          feedbackSnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            feedbacks.push({
              id: docSnapshot.id,
              ...data,
            });
          });
          
          setFeedbackReports(feedbacks);
        } catch (err) {
          console.error("Error fetching feedback:", err);
          setFeedbackReports([]);
        }
      } catch (error) {
        console.error("Error fetching F1 data:", error);
        setF1Data(prev => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to fetch F1 data",
        }));
      }
    };

    fetchF1DataForAdmin();
  }, [isPasswordAuthenticated]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isPasswordAuthenticated) return;
      
      try {
        const notificationsRef = doc(firestore, "metadata", "notifications");
        const notificationsDoc = await getDoc(notificationsRef);
        
        if (notificationsDoc.exists()) {
          setNotifications(notificationsDoc.data());
        } else {
          // Initialize with default structure if document doesn't exist
          const defaultNotifications = {
            account_page: { active: false, message: "", title: "" },
            calendar_page: { active: false, message: "", title: "" },
            home_page: { active: false, message: "", title: "" },
            predictor_page: { active: false, message: "", title: "" },
            standings_page: { active: false, message: "", title: "" },
          };
          setNotifications(defaultNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications(null);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [isPasswordAuthenticated]);

  // Fetch app lockdown status (show_maintenance from metadata/diagnostics)
  useEffect(() => {
    const fetchAppLockdown = async () => {
      if (!isPasswordAuthenticated) return;
      
      try {
        const diagnosticsRef = doc(firestore, "metadata", "diagnostics");
        const diagnosticsDoc = await getDoc(diagnosticsRef);
        
        if (diagnosticsDoc.exists()) {
          setShowMaintenance(diagnosticsDoc.data().show_maintenance || false);
        }
      } catch (error) {
        console.error("Error fetching app lockdown:", error);
      } finally {
        setLoadingLockdown(false);
      }
    };

    fetchAppLockdown();
  }, [isPasswordAuthenticated]);

  // Show loading while checking auth or loading credentials
  if (checkingAuth || loadingCredentials) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            border: "4px solid #444",
            borderTopColor: "#7c3aed",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 15px",
          }} />
          <p style={{ color: "#888" }}>Checking authentication...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // If not authenticated with Firebase or wrong email, don't show anything (will redirect)
  if (!user || !adminCredentials || user.email !== adminCredentials.allowedEmail) {
    return null;
  }

  // Show password prompt if not password-authenticated
  if (!isPasswordAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
        padding: 20,
      }}>
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: 12,
          padding: 40,
          maxWidth: 400,
          width: "100%",
          border: "1px solid #444",
        }}>
          <img
            src={GridlockLogo}
            alt="Gridlock Logo"
            style={{ width: 80, height: 80, margin: "0 auto 20px", display: "block" }}
          />
          <h2 style={{ color: "#fff", textAlign: "center", marginBottom: 10 }}>
            Admin Dashboard
          </h2>
          <p style={{ color: "#888", textAlign: "center", fontSize: 12, marginBottom: 20 }}>
            Enter password to continue
          </p>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #555",
              backgroundColor: "#1a1a1a",
              color: "#fff",
              fontSize: 14,
              marginBottom: 10,
              outline: "none",
            }}
          />
          {error && (
            <p style={{ color: "#ff4757", fontSize: 12, marginBottom: 10 }}>
              {error}
            </p>
          )}
          <button
            onClick={handlePasswordSubmit}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#7c3aed",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show admin dashboard
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#1a1a1a",
      color: "#fff",
      padding: 20,
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: "1px solid #444",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <img
            src={GridlockLogo}
            alt="Gridlock Logo"
            style={{ width: 50, height: 50 }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Admin Dashboard</h1>
            <p style={{ margin: 0, color: "#888", fontSize: 12 }}>
              {user.email} | {new Date().toLocaleString()}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={{
            color: "#888",
            fontSize: 12,
            fontFamily: "monospace",
            padding: "8px 12px",
            backgroundColor: "#2a2a2a",
            borderRadius: 6,
            border: "1px solid #444",
          }}>
            {PROJECT_ID}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              backgroundColor: "#ff4757",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: "#2a2a2a",
        padding: 40,
        borderRadius: 12,
        border: "1px solid #444",
      }}>

        {f1Data.loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{
              width: 40,
              height: 40,
              border: "4px solid #444",
              borderTopColor: "#7c3aed",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 15px",
            }} />
            <p style={{ color: "#888" }}>Loading F1 data...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : f1Data.error ? (
          <div style={{
            padding: 20,
            backgroundColor: "#ff475720",
            border: "1px solid #ff4757",
            borderRadius: 8,
            color: "#ff4757",
            textAlign: "center",
          }}>
            <p style={{ margin: 0 }}>Error: {f1Data.error}</p>
            {!import.meta.env.VITE_RAPIDAPI_KEY && (
              <p style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
                Note: VITE_RAPIDAPI_KEY not found in environment variables
              </p>
            )}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {/* Next Event */}
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: 20,
              borderRadius: 8,
              border: "1px solid #444",
            }}>
              <h3 style={{ margin: "0 0 15px", color: "#7c3aed", fontSize: 14 }}>
                NEXT EVENT
              </h3>
              {f1Data.nextEvent ? (
                <div>
                  <p style={{ margin: "5px 0", fontSize: 18, fontWeight: 700 }}>
                    {f1Data.nextEvent.name}
                  </p>
                  <p style={{ margin: "5px 0", color: "#888", fontSize: 12 }}>
                    {f1Data.nextEvent.circuitName}
                  </p>
                  <p style={{ margin: "5px 0", color: "#888", fontSize: 12 }}>
                    {f1Data.nextEvent.country}
                  </p>
                  {f1Data.roundNumber && (
                    <p style={{ margin: "10px 0 0", color: "#29F4D2", fontSize: 12 }}>
                      Round {f1Data.roundNumber}
                    </p>
                  )}
                  
                  {/* Session Times - API */}
                  {f1Data.nextEvent.events && f1Data.nextEvent.events.length > 0 && (
                    <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid #444" }}>
                      <p style={{ margin: "0 0 10px", color: "#7c3aed", fontSize: 11, fontWeight: 600 }}>
                        SESSION TIMES (API)
                      </p>
                      {f1Data.nextEvent.events
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((session, idx) => {
                          const sessionDate = new Date(session.date);
                          const formattedDate = sessionDate.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          });
                          const formattedTime = sessionDate.toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          });
                          return (
                            <div key={idx} style={{ marginBottom: 8 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#fff", fontSize: 11, fontWeight: 500 }}>
                                  {session.type}
                                </span>
                                <span style={{ color: "#888", fontSize: 11, fontFamily: "monospace" }}>
                                  {formattedDate} {formattedTime}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  
                  {/* Session Times - Firestore Database */}
                  {firestoreNextEvent && firestoreNextEvent.events && firestoreNextEvent.events.length > 0 ? (
                    <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid #444" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <p style={{ margin: 0, color: "#29F4D2", fontSize: 11, fontWeight: 600 }}>
                          SESSION TIMES (DATABASE)
                        </p>
                        {checkSessionsMatch() ? (
                          <span style={{ color: "#29F4D2", fontSize: 9 }}>✓ Matched</span>
                        ) : (
                          <span style={{ color: "#ff4757", fontSize: 9 }}>⚠ Times Don't Match</span>
                        )}
                      </div>
                      {!checkSessionsMatch() && (
                        <div style={{ marginBottom: 10 }}>
                          <button
                            onClick={handleToggleUseDatabaseData}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              backgroundColor: useDatabaseData ? "#7c3aed" : "red",
                              color: "#fff",
                              border: "none",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                            }}
                          >
                            {useDatabaseData ? "✓ Using Database Data" : "Use Database Data"}
                          </button>
                        </div>
                      )}
                      {firestoreNextEvent.events
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((session, idx) => {
                          const sessionDate = new Date(session.date);
                          const formattedDate = sessionDate.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          });
                          const formattedTime = sessionDate.toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          });
                          return (
                            <div key={idx} style={{ marginBottom: 8 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#fff", fontSize: 11, fontWeight: 500 }}>
                                  {session.type}
                                </span>
                                <span style={{ color: "#888", fontSize: 11, fontFamily: "monospace" }}>
                                  {formattedDate} {formattedTime}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : firestoreNextEvent === null && f1Data.nextEvent ? (
                    <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid #444" }}>
                      <p style={{ margin: 0, color: "#ff4757", fontSize: 11 }}>
                        ⚠ No matching event found in database
                      </p>
                      <p style={{ margin: "5px 0 0", color: "#888", fontSize: 10 }}>
                        Looking for: {f1Data.nextEvent.name || f1Data.nextEvent.circuitName} (ID: {f1Data.nextEvent.id})
                      </p>
                    </div>
                  ) : null}
                  
                  {/* F1 Website Link and Edit Button */}
                  <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid #444", display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                    <a
                      href={`https://www.formula1.com/en/racing/${f1Data.seasonYear}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        color: "#7c3aed",
                        fontSize: 11,
                        textDecoration: "none",
                        fontWeight: 600,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => e.target.style.color = "#9d5cf0"}
                      onMouseLeave={(e) => e.target.style.color = "#7c3aed"}
                    >
                      Verify on F1.com →
                    </a>
                    {firestoreNextEvent && firestoreNextEvent.events && firestoreNextEvent.events.length > 0 && (
                      <button
                        onClick={isEditingDatabase ? handleCancelEdit : handleStartEdit}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          backgroundColor: isEditingDatabase ? "#444" : "#29F4D2",
                          color: "#fff",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isEditingDatabase) e.target.style.backgroundColor = "#1dd1a1";
                        }}
                        onMouseLeave={(e) => {
                          if (!isEditingDatabase) e.target.style.backgroundColor = "#29F4D2";
                        }}
                      >
                        {isEditingDatabase ? "Cancel" : "Edit Database Data"}
                      </button>
                    )}
                  </div>
                  
                  {/* Editable Session Times */}
                  {isEditingDatabase && editedSessions.length > 0 && (
                    <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid #29F4D2", backgroundColor: "#1a1a1a", padding: 15, borderRadius: 8 }}>
                      <p style={{ margin: "0 0 15px", color: "#29F4D2", fontSize: 11, fontWeight: 600 }}>
                        EDIT SESSION TIMES
                      </p>
                      {editedSessions
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((session) => {
                          const originalSession = firestoreNextEvent.events.find(s => s.type === session.type);
                          return (
                            <div key={session.type} style={{ marginBottom: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                                <span style={{ color: "#fff", fontSize: 11, fontWeight: 500 }}>
                                  {session.type}
                                </span>
                                <input
                                  type="datetime-local"
                                  value={session.date}
                                  onChange={(e) => handleSessionTimeChange(session.type, e.target.value)}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: 4,
                                    border: "1px solid #555",
                                    backgroundColor: "#2a2a2a",
                                    color: "#fff",
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    outline: "none",
                                  }}
                                />
                              </div>
                              {originalSession && new Date(session.date).getTime() !== new Date(originalSession.date).getTime() && (
                                <p style={{ margin: "2px 0 0", color: "#888", fontSize: 9 }}>
                                  Original: {new Date(originalSession.date).toLocaleString('en-GB')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                        <button
                          onClick={handleSaveDatabase}
                          disabled={savingDatabase}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 6,
                            backgroundColor: savingDatabase ? "#444" : "#7c3aed",
                            color: "#fff",
                            border: "none",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: savingDatabase ? "not-allowed" : "pointer",
                            transition: "background-color 0.2s",
                          }}
                        >
                          {savingDatabase ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingDatabase}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 6,
                            backgroundColor: "#444",
                            color: "#fff",
                            border: "none",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: savingDatabase ? "not-allowed" : "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: "#888", fontSize: 12 }}>No upcoming events</p>
              )}
            </div>

            {/* Diagnostics */}
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: 20,
              borderRadius: 8,
              border: "1px solid #444",
              maxHeight: "80vh",
              overflowY: "auto",
            }}>
              <h3 style={{ margin: "0 0 15px", color: "#29F4D2", fontSize: 14 }}>
                DIAGNOSTICS
              </h3>
              {Object.keys(diagnosticsData).length > 0 ? (
                <div>
                  {/* Next Event Diagnostics */}
                  {f1Data.nextEvent && diagnosticsData[f1Data.nextEvent.id] && 
                    renderDiagnosticsForEvent(
                      f1Data.nextEvent.id,
                      f1Data.nextEvent.name,
                      diagnosticsData[f1Data.nextEvent.id]
                    )
                  }
                  
                  {/* All Events with Diagnostics - show all diagnostics, match to events if possible */}
                  {(() => {
                    // Get all event IDs from diagnostics
                    const allDiagnosticsEventIds = Object.keys(diagnosticsData);
                    
                    // Create a map of event ID to event name from f1Data.events
                    const eventNameMap = {};
                    if (f1Data.events && f1Data.events.length > 0) {
                      f1Data.events.forEach(event => {
                        if (event.id) {
                          eventNameMap[event.id] = event.name;
                        }
                      });
                    }
                    
                    // Render all diagnostics, using event name if available, otherwise use event ID
                    return allDiagnosticsEventIds
                      .filter(eventId => !f1Data.nextEvent || eventId !== f1Data.nextEvent.id)
                      .map(eventId => {
                        const eventName = eventNameMap[eventId] || `Event ${eventId}`;
                        return renderDiagnosticsForEvent(
                          eventId,
                          eventName,
                          diagnosticsData[eventId]
                        );
                      });
                  })()}
                  
                  {Object.keys(diagnosticsData).length === 0 && (
                    <p style={{ color: "#888", fontSize: 12 }}>No diagnostics data available</p>
                  )}
                </div>
              ) : (
                <p style={{ color: "#888", fontSize: 12 }}>No diagnostics data available</p>
              )}
            </div>

            {/* Live Event */}
            {f1Data.liveEvent && (
              <div style={{
                backgroundColor: "#ff475720",
                padding: 20,
                borderRadius: 8,
                border: "2px solid #ff4757",
              }}>
                <h3 style={{ margin: "0 0 15px", color: "#ff4757", fontSize: 14 }}>
                  LIVE EVENT
                </h3>
                <p style={{ margin: "5px 0", fontSize: 18, fontWeight: 700 }}>
                  {f1Data.liveEvent.type}
                </p>
                <p style={{ margin: "5px 0", color: "#888", fontSize: 12 }}>
                  {f1Data.liveEvent.competition?.name || "Live"}
                </p>
              </div>
            )}

            {/* App Health */}
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: 20,
              borderRadius: 8,
              border: "1px solid #444",
              maxHeight: "80vh",
              overflowY: "auto",
            }}>
              <h3 style={{ margin: "0 0 15px", color: "#29F4D2", fontSize: 14 }}>
                APP HEALTH
              </h3>
              
              {/* Bug Reports Section */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h4 style={{ margin: 0, color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                    BUG REPORTS
                  </h4>
                  <span style={{ color: "#888", fontSize: 11 }}>
                    {bugReports.filter(r => !r.seen).length} unread
                  </span>
                </div>
                
                {bugReports.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {bugReports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => handleBugReportClick(report)}
                        style={{
                          width: "100%",
                          padding: 12,
                          backgroundColor: report.seen ? "#2a2a2a" : "#2a2a2a",
                          border: report.seen ? "1px solid #444" : "1px solid #7c3aed",
                          borderRadius: 6,
                          textAlign: "left",
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        {!report.seen && (
                          <div style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 8,
                            height: 8,
                            backgroundColor: "#7c3aed",
                            borderRadius: "50%",
                          }} />
                        )}
                        <p style={{ margin: "0 0 4px", color: "#fff", fontSize: 11, fontWeight: 600 }}>
                          {report.email}
                        </p>
                        <p style={{ margin: 0, color: "#888", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {report.report}
                        </p>
                        {report.timestamp && (
                          <p style={{ margin: "4px 0 0", color: "#666", fontSize: 9 }}>
                            {new Date(report.timestamp.toDate ? report.timestamp.toDate() : report.timestamp).toLocaleString('en-GB')}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#888", fontSize: 11 }}>No bug reports</p>
                )}
              </div>
              
              {/* Feedback Section */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h4 style={{ margin: 0, color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                    FEEDBACK
                  </h4>
                  <span style={{ color: "#888", fontSize: 11 }}>
                    {feedbackReports.filter(f => !f.seen).length} unread
                  </span>
                </div>
                
                {feedbackReports.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {feedbackReports.map((feedback) => (
                      <button
                        key={feedback.id}
                        onClick={() => handleFeedbackClick(feedback)}
                        style={{
                          width: "100%",
                          padding: 12,
                          backgroundColor: feedback.seen ? "#2a2a2a" : "#2a2a2a",
                          border: feedback.seen ? "1px solid #444" : "1px solid #29F4D2",
                          borderRadius: 6,
                          textAlign: "left",
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        {!feedback.seen && (
                          <div style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 8,
                            height: 8,
                            backgroundColor: "#29F4D2",
                            borderRadius: "50%",
                          }} />
                        )}
                        <p style={{ margin: "0 0 4px", color: "#fff", fontSize: 11, fontWeight: 600 }}>
                          {feedback.email}
                        </p>
                        <p style={{ margin: 0, color: "#888", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {feedback.report}
                        </p>
                        {feedback.timestamp && (
                          <p style={{ margin: "4px 0 0", color: "#666", fontSize: 9 }}>
                            {new Date(feedback.timestamp.toDate ? feedback.timestamp.toDate() : feedback.timestamp).toLocaleString('en-GB')}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#888", fontSize: 11 }}>No feedback</p>
                )}
              </div>
            </div>

            {/* Race Reports */}
            <div style={{
              backgroundColor: "#1a1a1a",
              padding: 20,
              borderRadius: 8,
              border: "1px solid #444",
              marginTop: 20,
            }}>
              <h3 style={{ margin: "0 0 15px", color: "#29F4D2", fontSize: 14 }}>
                RACE REPORTS
              </h3>
              
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#888", fontSize: 12, fontWeight: 600 }}>
                  Select Race
                </label>
                <select
                  value={selectedRaceId}
                  onChange={(e) => setSelectedRaceId(e.target.value)}
                  disabled={runningReport || runningAnalysis || runningRecalculation || updatingStandings}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #444",
                    borderRadius: 6,
                    color: "#fff",
                    fontSize: 12,
                    cursor: runningReport || runningAnalysis || runningRecalculation || updatingStandings ? "not-allowed" : "pointer",
                  }}
                >
                  <option value="">-- Select a race --</option>
                  {f1Data.events && f1Data.events
                    .filter(competition => {
                      // Check if this competition has a Race event
                      return competition.events && competition.events.some(event => event.type === "Race");
                    })
                    .map(competition => {
                      // Find the Race event to get its date
                      const raceEvent = competition.events.find(event => event.type === "Race");
                      return {
                        ...competition,
                        raceDate: raceEvent ? raceEvent.date : null,
                      };
                    })
                    .sort((a, b) => {
                      const dateA = a.raceDate ? new Date(a.raceDate) : new Date(0);
                      const dateB = b.raceDate ? new Date(b.raceDate) : new Date(0);
                      return dateB - dateA; // Most recent first
                    })
                    .map((competition) => (
                      <option key={competition.id} value={competition.id}>
                        {competition.name} {competition.raceDate && `(${new Date(competition.raceDate).toLocaleDateString('en-GB')})`}
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <button
                  onClick={handleRunReport}
                  disabled={!selectedRaceId || runningReport || runningAnalysis || runningRecalculation || updatingStandings}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    padding: "12px 16px",
                    borderRadius: 6,
                    backgroundColor: runningReport || !selectedRaceId || runningAnalysis || runningRecalculation || updatingStandings ? "#444" : "#7c3aed",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: runningReport || !selectedRaceId || runningAnalysis || runningRecalculation || updatingStandings ? "not-allowed" : "pointer",
                    opacity: runningReport || !selectedRaceId || runningAnalysis || runningRecalculation || updatingStandings ? 0.6 : 1,
                  }}
                >
                  {runningReport ? "Running..." : "Run Weekend Report"}
                </button>
                <button
                  onClick={handleRunAnalysis}
                  disabled={!selectedRaceId || runningAnalysis || runningReport || runningRecalculation || updatingStandings}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    padding: "12px 16px",
                    borderRadius: 6,
                    backgroundColor: runningAnalysis || !selectedRaceId || runningReport || runningRecalculation || updatingStandings ? "#444" : "#29F4D2",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: runningAnalysis || !selectedRaceId || runningReport || runningRecalculation || updatingStandings ? "not-allowed" : "pointer",
                    opacity: runningAnalysis || !selectedRaceId || runningReport || runningRecalculation || updatingStandings ? 0.6 : 1,
                  }}
                >
                  {runningAnalysis ? "Running..." : "Run Model Analysis"}
                </button>
                <button
                  onClick={handleRecalculatePoints}
                  disabled={runningRecalculation || runningReport || runningAnalysis || updatingStandings}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    padding: "12px 16px",
                    borderRadius: 6,
                    backgroundColor: runningRecalculation || runningReport || runningAnalysis || updatingStandings ? "#444" : "#ff6b6b",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: runningRecalculation || runningReport || runningAnalysis || updatingStandings ? "not-allowed" : "pointer",
                    opacity: runningRecalculation || runningReport || runningAnalysis || updatingStandings ? 0.6 : 1,
                  }}
                >
                  {runningRecalculation ? "Running..." : "Recalculate Points"}
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <button
                  onClick={handleUpdateGlobalStandings}
                  disabled={updatingStandings || runningReport || runningAnalysis || runningRecalculation || !f1Data.previousEvent}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 6,
                    backgroundColor: updatingStandings || runningReport || runningAnalysis || runningRecalculation || !f1Data.previousEvent ? "#444" : "#10b981",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: updatingStandings || runningReport || runningAnalysis || runningRecalculation || !f1Data.previousEvent ? "not-allowed" : "pointer",
                    opacity: updatingStandings || runningReport || runningAnalysis || runningRecalculation || !f1Data.previousEvent ? 0.6 : 1,
                  }}
                >
                  {updatingStandings ? "Updating..." : "Update Global Standings"}
                </button>
              </div>

              {reportResult && (
                <div style={{
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: "#2a2a2a",
                  borderRadius: 6,
                  border: "1px solid #444",
                  marginBottom: 20,
                }}>
                  <h4 style={{ margin: "0 0 10px", color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                    WEEKEND REPORT RESULT
                  </h4>
                  <pre style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}>
                    {reportResult}
                  </pre>
                </div>
              )}

              {analysisResult && (
                <div style={{
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: "#2a2a2a",
                  borderRadius: 6,
                  border: "1px solid #444",
                  marginBottom: 20,
                }}>
                  <h4 style={{ margin: "0 0 10px", color: "#29F4D2", fontSize: 12, fontWeight: 600 }}>
                    MODEL ANALYSIS RESULT
                  </h4>
                  <pre style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}>
                    {analysisResult}
                  </pre>
                </div>
              )}

              {recalculationResult && (
                <div style={{
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: "#2a2a2a",
                  borderRadius: 6,
                  border: "1px solid #444",
                  marginBottom: 20,
                }}>
                  <h4 style={{ margin: "0 0 10px", color: "#ff6b6b", fontSize: 12, fontWeight: 600 }}>
                    POINTS RECALCULATION RESULT
                  </h4>
                  <pre style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}>
                    {recalculationResult}
                  </pre>
                </div>
              )}

              {standingsUpdateResult && (
                <div style={{
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: "#2a2a2a",
                  borderRadius: 6,
                  border: "1px solid #444",
                  marginBottom: 20,
                }}>
                  <h4 style={{ margin: "0 0 10px", color: "#10b981", fontSize: 12, fontWeight: 600 }}>
                    GLOBAL STANDINGS UPDATE RESULT
                  </h4>
                  <pre style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}>
                    {standingsUpdateResult}
                  </pre>
                </div>
              )}

              {seasonPrepResult && (
                <div style={{
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: "#2a2a2a",
                  borderRadius: 6,
                  border: "1px solid #444",
                  marginBottom: 20,
                }}>
                  <h4 style={{ margin: "0 0 10px", color: "#ff4757", fontSize: 12, fontWeight: 600 }}>
                    SEASON PREPARATION RESULT
                  </h4>
                  <pre style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: 11,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}>
                    {seasonPrepResult}
                  </pre>
                </div>
              )}

              {!import.meta.env.VITE_GRIDLOCK_API && (
                <p style={{ marginTop: 10, color: "#ff4757", fontSize: 11 }}>
                  ⚠️ Note: VITE_GRIDLOCK_API not found in environment variables
                </p>
              )}

              {/* Dangerous: Prepare for New Season */}
              <div style={{
                marginTop: 30,
                padding: 20,
                backgroundColor: "#2a1a1a",
                borderRadius: 8,
                border: "2px solid #ff4757",
                marginBottom: 20,
              }}>
                <h3 style={{ margin: "0 0 10px", color: "#ff4757", fontSize: 14, fontWeight: 700 }}>
                  ⚠️ DANGEROUS OPERATION
                </h3>
                <p style={{ margin: "0 0 15px", color: "#ff9999", fontSize: 11, lineHeight: 1.5 }}>
                  This will reset all user data, league standings, and global standings for the new season. 
                  This operation can only be run once per year and will be blocked if already executed. 
                  Use with extreme caution.
                </p>
                <button
                  onClick={() => setShowSeasonPrepConfirm(true)}
                  disabled={preparingSeason || runningReport || runningAnalysis || runningRecalculation || updatingStandings}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 6,
                    backgroundColor: preparingSeason || runningReport || runningAnalysis || runningRecalculation || updatingStandings ? "#444" : "#ff4757",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: preparingSeason || runningReport || runningAnalysis || runningRecalculation || updatingStandings ? "not-allowed" : "pointer",
                    opacity: preparingSeason || runningReport || runningAnalysis || runningRecalculation || updatingStandings ? 0.6 : 1,
                  }}
                >
                  {preparingSeason ? "Preparing Season..." : "Prepare for New Season"}
                </button>
              </div>
            </div>
            
            {/* Bug Report Modal */}
            {showBugReportModal && selectedBugReport && (
              <div
                onClick={() => setShowBugReportModal(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  padding: 20,
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: "#2a2a2a",
                    borderRadius: 12,
                    padding: 24,
                    maxWidth: 600,
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    border: "1px solid #444",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ margin: 0, color: "#fff", fontSize: 18 }}>Bug Report</h2>
                    <button
                      onClick={() => setShowBugReportModal(false)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#888",
                        fontSize: 24,
                        cursor: "pointer",
                        padding: 0,
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Report Content */}
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ margin: "0 0 10px", color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                      REPORT
                    </h3>
                    <p style={{ margin: 0, color: "#fff", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {selectedBugReport.report}
                    </p>
                  </div>
                  
                  {/* Timestamp */}
                  {selectedBugReport.timestamp && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ margin: "0 0 10px", color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                        TIMESTAMP
                      </h3>
                      <p style={{ margin: 0, color: "#888", fontSize: 12, fontFamily: "monospace" }}>
                        {new Date(selectedBugReport.timestamp.toDate ? selectedBugReport.timestamp.toDate() : selectedBugReport.timestamp).toLocaleString('en-GB')}
                      </p>
                    </div>
                  )}
                  
                  {/* User Information */}
                  {selectedBugReport.userInfo && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ margin: "0 0 10px", color: "#7c3aed", fontSize: 12, fontWeight: 600 }}>
                        USER INFORMATION
                      </h3>
                      <div style={{ backgroundColor: "#1a1a1a", padding: 15, borderRadius: 8, fontSize: 11 }}>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ color: "#888" }}>Email: </span>
                          <span style={{ color: "#fff" }}>{selectedBugReport.email}</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ color: "#888" }}>User ID: </span>
                          <span style={{ color: "#fff", fontFamily: "monospace" }}>{selectedBugReport.userId}</span>
                        </div>
                        {selectedBugReport.userInfo.username && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Username: </span>
                            <span style={{ color: "#fff" }}>{selectedBugReport.userInfo.username}</span>
                          </div>
                        )}
                        {selectedBugReport.userInfo.version && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>App Version: </span>
                            <span style={{ color: "#fff" }}>{selectedBugReport.userInfo.version}</span>
                          </div>
                        )}
                        {selectedBugReport.userInfo.points !== undefined && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Points: </span>
                            <span style={{ color: "#fff" }}>{selectedBugReport.userInfo.points}</span>
                          </div>
                        )}
                        {selectedBugReport.userInfo.globalPosition !== undefined && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Global Position: </span>
                            <span style={{ color: "#fff" }}>#{selectedBugReport.userInfo.globalPosition}</span>
                          </div>
                        )}
                        {selectedBugReport.userInfo.gridBoost !== undefined && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Grid Boost: </span>
                            <span style={{ color: "#fff" }}>{selectedBugReport.userInfo.gridBoost}</span>
                          </div>
                        )}
                        {selectedBugReport.userInfo.qualiBoost !== undefined && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Quali Boost: </span>
                            <span style={{ color: "#fff" }}>{selectedBugReport.userInfo.qualiBoost}</span>
                          </div>
                        )}
                        {selectedBugReport.userInfo.privateLeagues && selectedBugReport.userInfo.privateLeagues.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Private Leagues: </span>
                            <span style={{ color: "#fff" }}>{selectedBugReport.userInfo.privateLeagues.join(", ")}</span>
                          </div>
                        )}
                        {selectedBugReport.userInfo.publicLeagues && selectedBugReport.userInfo.publicLeagues.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Public Leagues: </span>
                            <span style={{ color: "#fff" }}>{selectedBugReport.userInfo.publicLeagues.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 20, borderTop: "1px solid #444" }}>
                    <button
                      onClick={() => handleReplyToBugReport(selectedBugReport)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: 6,
                        backgroundColor: "#7c3aed",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => handleMarkBugReportSeen(selectedBugReport.id, !selectedBugReport.seen)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: 6,
                        backgroundColor: selectedBugReport.seen ? "#444" : "#29F4D2",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {selectedBugReport.seen ? "Mark Unseen" : "Mark Seen"}
                    </button>
                    <button
                      onClick={() => handleDeleteBugReport(selectedBugReport.id)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: 6,
                        backgroundColor: "#ff4757",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Feedback Modal */}
            {showFeedbackModal && selectedFeedback && (
              <div
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  padding: 20,
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: "#2a2a2a",
                    borderRadius: 12,
                    padding: 24,
                    maxWidth: 600,
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    border: "1px solid #444",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ margin: 0, color: "#fff", fontSize: 18 }}>Feedback</h2>
                    <button
                      onClick={() => setShowFeedbackModal(false)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#888",
                        fontSize: 24,
                        cursor: "pointer",
                        padding: 0,
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Feedback Content */}
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ margin: "0 0 10px", color: "#29F4D2", fontSize: 12, fontWeight: 600 }}>
                      FEEDBACK
                    </h3>
                    <p style={{ margin: 0, color: "#fff", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {selectedFeedback.feedback}
                    </p>
                  </div>
                  
                  {/* Timestamp */}
                  {selectedFeedback.timestamp && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ margin: "0 0 10px", color: "#29F4D2", fontSize: 12, fontWeight: 600 }}>
                        TIMESTAMP
                      </h3>
                      <p style={{ margin: 0, color: "#888", fontSize: 12, fontFamily: "monospace" }}>
                        {new Date(selectedFeedback.timestamp.toDate ? selectedFeedback.timestamp.toDate() : selectedFeedback.timestamp).toLocaleString('en-GB')}
                      </p>
                    </div>
                  )}
                  
                  {/* User Information */}
                  {selectedFeedback.userInfo && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ margin: "0 0 10px", color: "#29F4D2", fontSize: 12, fontWeight: 600 }}>
                        USER INFORMATION
                      </h3>
                      <div style={{ backgroundColor: "#1a1a1a", padding: 15, borderRadius: 8, fontSize: 11 }}>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ color: "#888" }}>Email: </span>
                          <span style={{ color: "#fff" }}>{selectedFeedback.email}</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ color: "#888" }}>User ID: </span>
                          <span style={{ color: "#fff", fontFamily: "monospace" }}>{selectedFeedback.userId}</span>
                        </div>
                        {selectedFeedback.userInfo.username && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Username: </span>
                            <span style={{ color: "#fff" }}>{selectedFeedback.userInfo.username}</span>
                          </div>
                        )}
                        {selectedFeedback.userInfo.version && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>App Version: </span>
                            <span style={{ color: "#fff" }}>{selectedFeedback.userInfo.version}</span>
                          </div>
                        )}
                        {selectedFeedback.userInfo.points !== undefined && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Points: </span>
                            <span style={{ color: "#fff" }}>{selectedFeedback.userInfo.points}</span>
                          </div>
                        )}
                        {selectedFeedback.userInfo.globalPosition !== undefined && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Global Position: </span>
                            <span style={{ color: "#fff" }}>#{selectedFeedback.userInfo.globalPosition}</span>
                          </div>
                        )}
                        {selectedFeedback.userInfo.gridBoost !== undefined && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Grid Boost: </span>
                            <span style={{ color: "#fff" }}>{selectedFeedback.userInfo.gridBoost}</span>
                          </div>
                        )}
                        {selectedFeedback.userInfo.qualiBoost !== undefined && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Quali Boost: </span>
                            <span style={{ color: "#fff" }}>{selectedFeedback.userInfo.qualiBoost}</span>
                          </div>
                        )}
                        {selectedFeedback.userInfo.privateLeagues && selectedFeedback.userInfo.privateLeagues.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Private Leagues: </span>
                            <span style={{ color: "#fff" }}>{selectedFeedback.userInfo.privateLeagues.join(", ")}</span>
                          </div>
                        )}
                        {selectedFeedback.userInfo.publicLeagues && selectedFeedback.userInfo.publicLeagues.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ color: "#888" }}>Public Leagues: </span>
                            <span style={{ color: "#fff" }}>{selectedFeedback.userInfo.publicLeagues.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 20, borderTop: "1px solid #444" }}>
                    <button
                      onClick={() => handleReplyToFeedback(selectedFeedback)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: 6,
                        backgroundColor: "#7c3aed",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => handleMarkFeedbackSeen(selectedFeedback.id, !selectedFeedback.seen)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: 6,
                        backgroundColor: selectedFeedback.seen ? "#444" : "#29F4D2",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {selectedFeedback.seen ? "Mark Unseen" : "Mark Seen"}
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: 6,
                        backgroundColor: "#ff4757",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Season Preparation Confirmation Modal */}
            {showSeasonPrepConfirm && (
              <div
                onClick={() => setShowSeasonPrepConfirm(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2000,
                  padding: 20,
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: "#2a1a1a",
                    borderRadius: 12,
                    padding: 30,
                    maxWidth: 500,
                    width: "100%",
                    border: "2px solid #ff4757",
                  }}
                >
                  <h2 style={{ margin: "0 0 15px", color: "#ff4757", fontSize: 20, fontWeight: 700 }}>
                    ⚠️ DANGEROUS OPERATION
                  </h2>
                  <p style={{ margin: "0 0 20px", color: "#ff9999", fontSize: 13, lineHeight: 1.6 }}>
                    You are about to prepare for a new season. This will:
                  </p>
                  <ul style={{ margin: "0 0 20px", paddingLeft: 20, color: "#ff9999", fontSize: 12, lineHeight: 1.8 }}>
                    <li>Reset all user data (gridBoostUsed, qualiBoostUsed, hasPredicted, totalPoints, topPredictionsCount)</li>
                    <li>Reset all public league standings</li>
                    <li>Reset all private league standings</li>
                    <li>Reset global standings</li>
                  </ul>
                  <p style={{ margin: "0 0 20px", color: "#ff9999", fontSize: 13, lineHeight: 1.6, fontWeight: 600 }}>
                    This operation can only be run once per year. The system will block it if it has already been executed.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setShowSeasonPrepConfirm(false)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 6,
                        backgroundColor: "#444",
                        color: "#fff",
                        border: "none",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePrepareForNewSeason}
                      disabled={preparingSeason}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 6,
                        backgroundColor: preparingSeason ? "#444" : "#ff4757",
                        color: "#fff",
                        border: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: preparingSeason ? "not-allowed" : "pointer",
                        opacity: preparingSeason ? 0.6 : 1,
                      }}
                    >
                      {preparingSeason ? "Preparing..." : "Confirm & Execute"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications Management Section */}
        <div style={{
          marginTop: 40,
          padding: 30,
          backgroundColor: "#1a1a1a",
          borderRadius: 12,
          border: "1px solid #444",
        }}>
          <h2 style={{ margin: "0 0 20px", color: "#7c3aed", fontSize: 18, fontWeight: 700 }}>
            📢 NOTIFICATIONS MANAGEMENT
          </h2>
          
          {loadingNotifications ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <p style={{ color: "#888" }}>Loading notifications...</p>
            </div>
          ) : !notifications ? (
            <div style={{ padding: 20, backgroundColor: "#ff475720", border: "1px solid #ff4757", borderRadius: 8 }}>
              <p style={{ color: "#ff4757", margin: 0 }}>Failed to load notifications</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {Object.entries(notifications).map(([pageKey, notification]) => {
                const pageNames = {
                  account_page: "Account Page",
                  calendar_page: "Calendar Page",
                  home_page: "Home Page",
                  predictor_page: "Predictor Page",
                  standings_page: "Standings Page",
                };
                const isEditingThis = editingPageKey === pageKey;
                
                return (
                  <div
                    key={pageKey}
                    style={{
                      padding: 20,
                      backgroundColor: "#2a2a2a",
                      borderRadius: 8,
                      border: "1px solid #444",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                      <h3 style={{ margin: 0, color: "#fff", fontSize: 14, fontWeight: 600 }}>
                        {pageNames[pageKey] || pageKey}
                      </h3>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{
                          fontSize: 11,
                          color: notification.active ? "#29F4D2" : "#888",
                          fontWeight: 600,
                        }}>
                          {notification.active ? "● ACTIVE" : "○ INACTIVE"}
                        </span>
                        <button
                          onClick={() => handleToggleNotification(pageKey)}
                          disabled={savingNotification}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            backgroundColor: notification.active ? "#ff4757" : "#29F4D2",
                            color: "#fff",
                            border: "none",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: savingNotification ? "not-allowed" : "pointer",
                            opacity: savingNotification ? 0.6 : 1,
                          }}
                        >
                          {savingNotification ? "..." : notification.active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>

                    {isEditingThis ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                          <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 5 }}>
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingNotification.title || ""}
                            onChange={(e) => setEditingNotification({ ...editingNotification, title: e.target.value })}
                            style={{
                              width: "100%",
                              padding: 8,
                              borderRadius: 6,
                              border: "1px solid #555",
                              backgroundColor: "#1a1a1a",
                              color: "#fff",
                              fontSize: 12,
                              outline: "none",
                            }}
                            placeholder="Notification title"
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", color: "#888", fontSize: 11, marginBottom: 5 }}>
                            Message
                          </label>
                          <textarea
                            value={editingNotification.message || ""}
                            onChange={(e) => setEditingNotification({ ...editingNotification, message: e.target.value })}
                            rows={4}
                            style={{
                              width: "100%",
                              padding: 8,
                              borderRadius: 6,
                              border: "1px solid #555",
                              backgroundColor: "#1a1a1a",
                              color: "#fff",
                              fontSize: 12,
                              outline: "none",
                              resize: "vertical",
                              fontFamily: "inherit",
                            }}
                            placeholder="Notification message"
                          />
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={() => handleSaveNotification(pageKey)}
                            disabled={savingNotification}
                            style={{
                              flex: 1,
                              padding: "8px 16px",
                              borderRadius: 6,
                              backgroundColor: "#7c3aed",
                              color: "#fff",
                              border: "none",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: savingNotification ? "not-allowed" : "pointer",
                              opacity: savingNotification ? 0.6 : 1,
                            }}
                          >
                            {savingNotification ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEditNotification}
                            disabled={savingNotification}
                            style={{
                              flex: 1,
                              padding: "8px 16px",
                              borderRadius: 6,
                              backgroundColor: "#444",
                              color: "#fff",
                              border: "none",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: savingNotification ? "not-allowed" : "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ marginBottom: 10 }}>
                          <p style={{ margin: "0 0 5px", color: "#888", fontSize: 11 }}>Title:</p>
                          <p style={{ margin: 0, color: "#fff", fontSize: 13, fontWeight: 500 }}>
                            {notification.title || <span style={{ color: "#666", fontStyle: "italic" }}>No title</span>}
                          </p>
                        </div>
                        <div style={{ marginBottom: 15 }}>
                          <p style={{ margin: "0 0 5px", color: "#888", fontSize: 11 }}>Message:</p>
                          <p style={{ margin: 0, color: "#bbb", fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                            {notification.message || <span style={{ color: "#666", fontStyle: "italic" }}>No message</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartEditNotification(pageKey)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            backgroundColor: "#444",
                            color: "#fff",
                            border: "none",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* App Lockdown Section */}
        <div style={{
          marginTop: 40,
          padding: 30,
          backgroundColor: "#1a1a1a",
          borderRadius: 12,
          border: "1px solid #444",
        }}>
          <h2 style={{ margin: "0 0 20px", color: "#ff4757", fontSize: 18, fontWeight: 700 }}>
            🔒 APP LOCKDOWN
          </h2>
          
          {loadingLockdown ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <p style={{ color: "#888" }}>Loading lockdown status...</p>
            </div>
          ) : (
            <div style={{
              padding: 20,
              backgroundColor: "#2a2a2a",
              borderRadius: 8,
              border: `1px solid ${showMaintenance ? "#ff4757" : "#444"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 5px", color: "#fff", fontSize: 14, fontWeight: 600 }}>
                    Maintenance Mode Status
                  </p>
                  <p style={{ margin: 0, color: showMaintenance ? "#ff4757" : "#29F4D2", fontSize: 12 }}>
                    {showMaintenance ? "🔒 MAINTENANCE MODE ON - App is in maintenance" : "🔓 NORMAL MODE - App is accessible"}
                  </p>
                </div>
                <button
                  onClick={handleToggleAppLockdown}
                  disabled={savingLockdown}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    backgroundColor: showMaintenance ? "#ff4757" : "#29F4D2",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: savingLockdown ? "not-allowed" : "pointer",
                    opacity: savingLockdown ? 0.6 : 1,
                  }}
                >
                  {savingLockdown ? "Updating..." : showMaintenance ? "Disable Maintenance" : "Enable Maintenance"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
