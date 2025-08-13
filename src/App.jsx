import { Hero } from "./components/Hero";
import { Routes, Route } from "react-router-dom";
import Payment from "./components/Payment";
import "./assets/styles.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </>
  );
}

export default App;
