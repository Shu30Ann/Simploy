export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  employeeDashboard: "/employee/dashboard",
  employeeCareerGps: "/employee/career-gps",
  employeeMarketplace: "/employee/dashboard#marketplace",
  employeeCareerBuddy: "/employee/career-gps#career-buddy",
  employeeSettings: "/employee/dashboard#settings",
  employeeApplications: "/employee/applications",
  employerDashboard: "/employer/dashboard",
  employerSimulator: "/employer/analytics/simulator",
  employerActionEngine: "/employer/action-engine",
};

export type UserRole = "employee" | "employer";

export function dashboardRouteFor(role: UserRole) {
  return role === "employee" ? routes.employeeDashboard : routes.employerDashboard;
}

export function authRouteWithRole(path: string, role: UserRole | null) {
  return role ? `${path}?role=${role}` : path;
}
