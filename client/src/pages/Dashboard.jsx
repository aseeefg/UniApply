import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user?.name}</h1>
        <button onClick={logout}>Log out</button>
      </header>
      <p>
        Signed in as <strong>{user?.role}</strong>. This is a placeholder — each
        role's real dashboard gets built out sprint by sprint.
      </p>
    </div>
  );
}
