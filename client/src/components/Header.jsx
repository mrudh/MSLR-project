import React from "react";

const Header = ({ title = "MSLR", onToggleMenu, onLogout, showHamburger, showLogout }) => {
  return (
    <div
      className="d-flex align-items-center justify-content-between px-3 py-3"
      style={{
        background: "#fff",
        borderBottom: "2px solid #8a8787ff",
      }}
    >
      <div className="d-flex align-items-center gap-3">
        {showHamburger && (
          <button
            type="button"
            className="btn p-0"
            onClick={onToggleMenu}
            aria-label="Toggle menu"
            style={{ border: "none", background: "transparent" }}
          >
            <span style={{ fontSize: 34, lineHeight: 1 }}>☰</span>
          </button>
        )}

        <div style={{ fontSize: 34, fontWeight: 500 }}>{title}</div>
      </div>
      
      {showLogout && (
      <button
        type="button"
        onClick={onLogout}
        className="btn logout-btn"
      >
        Logout
      </button>
      )}
    </div>
  );
};

export default Header;
