import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CreateReport from "./pages/CreateReport";
import ReportDetailCard from "./components/ReportDetailCard"; // Tambahkan import ini

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/report-input" element={<CreateReport />} />
        <Route path="/report-detail" element={<ReportDetailCard />} /> 
      </Routes>
    </Router>
  );
};

export default App;
