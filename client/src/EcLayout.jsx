import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import SideNav from "./components/SideNav";
import Footer from "./components/Footer";
import "./styles/ecLayout.css";

const EcLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", to: "/ec" },
    { label: "Referendums", to: "/ec/referendums" },
    { label: "Responses", to: "/ec/responses" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("loginEmail");
    navigate("/login");
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb" }}>
      <Header
        title="MSLR"
        onLogout={handleLogout}
        onToggleMenu={() => setIsMenuOpen((v) => !v)}
        showHamburger={true}
        showLogout={true}
      />

      <div className="d-flex main-section">
        <div className="d-none d-md-block" style={{ width: 320, borderRight: "1px solid #ddd", backgroundColor: "#fff" }}>
          <SideNav items={navItems} />
        </div>

        <div className={`mobileOverlay ${isMenuOpen ? "show" : ""}`} onClick={() => setIsMenuOpen(false)} />

        <div className={`mobileSidePanel ${isMenuOpen ? "open" : ""}`}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: 12 }}>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsMenuOpen(false)}>
              Close
            </button>
          </div>
          <SideNav items={navItems} onNavigate={() => setIsMenuOpen(false)} />
        </div>

        <div className="flex-grow-1 p-3 p-md-4">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EcLayout;
