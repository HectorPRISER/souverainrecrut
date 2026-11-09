import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout() {
  return (
    <>
      <Navbar />

      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            padding: "2rem",
            background: "#f3f4f6",
          }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}