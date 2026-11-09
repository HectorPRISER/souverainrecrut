import Button from "../ui/Button";

import type { User } from "../../types/user.types";

interface UserTableProps {
  users: User[];

  onEdit: (user: User) => void;

  onDelete: (user: User) => void;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
}: UserTableProps) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fff",
      }}
    >
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              {user.firstName} {user.lastName}
            </td>

            <td>{user.email}</td>

            <td>{user.role}</td>

            <td>
              <Button
                style={{
                  marginRight: "8px",
                  background: "#f59e0b",
                }}
                onClick={() => onEdit(user)}
              >
                Modifier
              </Button>

              <Button
                style={{
                  background: "#dc2626",
                }}
                onClick={() => onDelete(user)}
              >
                Supprimer
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}