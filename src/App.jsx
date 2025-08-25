import { Hero } from "./components/Hero";
import { Routes, Route } from "react-router-dom";
import Payment from "./components/Payment";
import "./assets/styles.css";
import Success from "./components/Success";
import Failed from "./components/Failed";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failed />} />
      </Routes>
    </>
  );
}

export default App;
