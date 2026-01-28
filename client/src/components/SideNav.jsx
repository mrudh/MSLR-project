import React from "react";
import { Link, useLocation } from "react-router-dom";

const SideNav = ({ items, onNavigate }) => {
  const location = useLocation();

  return (
    <div>
      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="d-block text-decoration-none"
            style={{
              padding: "22px 18px",
              borderBottom: "1px solid #ddd",
              color: "#000",
              fontSize: 20,
              background: active ? "#f3f3f3" : "#fff",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

export default SideNav;
