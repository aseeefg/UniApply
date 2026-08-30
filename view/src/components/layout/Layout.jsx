import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-80 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
