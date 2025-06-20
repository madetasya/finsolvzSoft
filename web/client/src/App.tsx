import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CreateReport from "./pages/CreateReport";
// import ReportDetailCard from "./components/ReportDetailCard";
import "./styles/globalFont.css";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/report-input" element={<CreateReport />} />
        {/* <Route path="/report-detail" element={<ReportDetailCard onDataChange={(data) => console.log(data)} />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
