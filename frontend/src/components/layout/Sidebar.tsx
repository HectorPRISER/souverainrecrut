import { NavLink } from "react-router-dom";

const menu = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Utilisateurs",
    path: "/users",
  },
  {
    label: "Candidats",
    path: "/candidates",
  },
  {
    label: "Offres",
    path: "/jobs",
  },
  {
    label: "Candidatures",
    path: "/applications",
  },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 240,
        background: "#111827",
        color: "#fff",
        minHeight: "calc(100vh - 70px)",
        padding: 20,
      }}
    >
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              color: "#fff",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 6,
              background: isActive
                ? "#2563eb"
                : "transparent",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}