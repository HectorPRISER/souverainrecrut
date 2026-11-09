import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import LoginPage from "../pages/auth/LoginPage";

import DashboardPage from "../pages/dashboard/DashboardPage";
import UsersPage from "../pages/users/UsersPage";
import CandidatesPage from "../pages/candidates/CandidatesPage";
import JobsPage from "../pages/jobs/JobsPage";
import ApplicationsPage from "../pages/applications/ApplicationsPage";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={<LoginPage />}
        />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/users"
          element={<UsersPage />}
        />

        <Route
          path="/candidates"
          element={<CandidatesPage />}
        />

        <Route
          path="/jobs"
          element={<JobsPage />}
        />

        <Route
          path="/applications"
          element={<ApplicationsPage />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}