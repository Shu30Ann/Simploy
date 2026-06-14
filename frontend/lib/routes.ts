export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  employeeDashboard: "/employee/dashboard",
  employeeApplications: "/employee/applications",
  employerDashboard: "/employer/dashboard",
  employerSimulator: "/employer/analytics/simulator",
};

export type UserRole = "employee" | "employer";

export function dashboardRouteFor(role: UserRole) {
  return role === "employee" ? routes.employeeDashboard : routes.employerDashboard;
}

export function authRouteWithRole(path: string, role: UserRole | null) {
  return role ? `${path}?role=${role}` : path;
}
