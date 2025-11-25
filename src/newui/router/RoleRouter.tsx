import React, { useEffect } from "react";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";
import { Role } from "../types";

const redirectByRole = (navigate: NavigateFunction, role: Role, search: string) => {
  const baseSearch = search || "";
  if (role === "manager") {
    navigate({ pathname: "/manager", search: baseSearch }, { replace: true });
    return;
  }
  navigate({ pathname: "/foreman", search: baseSearch }, { replace: true });
};

export default function RoleRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    const role: Role = roleParam === "manager" ? "manager" : "foreman";
    redirectByRole(navigate, role, location.search);
  }, [location.search, navigate]);

  return null;
}
