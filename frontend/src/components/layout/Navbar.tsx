import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header
      style={{
        height: 70,
        background: "#1f2937",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
      }}
    >
      <h2>SouverainRecrut</h2>

      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        <span>
          {user?.firstName} {user?.lastName}
        </span>

        <button
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}