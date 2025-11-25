import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import LegacyApp from "./legacy/LegacyApp";
import RoleRouter from "./newui/router/RoleRouter";
import F1_Home from "./newui/foreman/F1_Home";
import F2_ProjectReports from "./newui/foreman/F2_ProjectReports";
import F3_Step1 from "./newui/foreman/F3_Step1";
import F4_Step2 from "./newui/foreman/F4_Step2";
import F5_Step3 from "./newui/foreman/F5_Step3";
import F6_Preview from "./newui/foreman/F6_Preview";
import F7_Sent from "./newui/foreman/F7_Sent";
import D1_Dashboard from "./newui/manager/D1_Dashboard";
import D2_ObjectReports from "./newui/manager/D2_ObjectReports";
import D3_ReportCard from "./newui/manager/D3_ReportCard";
import D4_Analytics from "./newui/manager/D4_Analytics";
import { ForemanReportProvider } from "./newui/components/ForemanReportContext";

function AppContent() {
  const location = useLocation();
  const useLegacyUI = new URLSearchParams(location.search).get("legacy") === "1";

  if (useLegacyUI) {
    return <LegacyApp />;
  }

  return (
    <ForemanReportProvider>
      <Routes>
        <Route path="/" element={<RoleRouter />} />
        <Route path="/foreman" element={<F1_Home />} />
        <Route path="/foreman/project/:id" element={<F2_ProjectReports />} />
        <Route path="/foreman/new" element={<F3_Step1 />} />
        <Route path="/foreman/new/works" element={<F4_Step2 />} />
        <Route path="/foreman/new/resources" element={<F5_Step3 />} />
        <Route path="/foreman/new/preview" element={<F6_Preview />} />
        <Route path="/foreman/new/sent" element={<F7_Sent />} />
        <Route path="/manager" element={<D1_Dashboard />} />
        <Route path="/manager/project/:id" element={<D2_ObjectReports />} />
        <Route path="/manager/project/:id/report/:reportId" element={<D3_ReportCard />} />
        <Route path="/manager/project/:id/analytics" element={<D4_Analytics />} />
      </Routes>
    </ForemanReportProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
