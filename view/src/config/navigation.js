import {
  SearchIcon,
  SparkleIcon,
  BuildingIcon,
  QuestionIcon,
  ClipboardIcon,
  UsersIcon,
  ShieldIcon,
  ChartIcon,
  GridIcon,
} from "../components/icons";

export const dashboardNavItem = { to: "/dashboard", label: "Dashboard", icon: GridIcon };

export const navByRole = {
  student: [
    { to: "/circulars", label: "Browse circulars", icon: SearchIcon },
    { to: "/applications", label: "My applications", icon: ClipboardIcon },
    { to: "/recommendations", label: "Recommendations", icon: SparkleIcon },
    { to: "/universities", label: "Universities", icon: BuildingIcon },
    { to: "/quiz", label: "Program quiz", icon: QuestionIcon },
  ],
  university: [
    { to: "/university/circulars", label: "Manage circulars", icon: ClipboardIcon },
    { to: "/university/applicants", label: "Manage applicants", icon: UsersIcon },
  ],
  admin: [
    { to: "/admin/verifications", label: "Verifications", icon: ShieldIcon },
    { to: "/admin/users", label: "Manage users", icon: UsersIcon },
    { to: "/admin/analytics", label: "Analytics", icon: ChartIcon },
  ],
};

export const pageTitles = {
  "/dashboard": "Dashboard",
  "/circulars": "Browse Circulars",
  "/applications": "My Applications",
  "/recommendations": "Recommendations",
  "/universities": "Browse Universities",
  "/universities/compare": "Compare Universities",
  "/quiz": "Program Quiz",
  "/student/profile": "My Profile",
  "/university/profile": "University Profile",
  "/university/circulars": "Manage Circulars",
  "/university/applicants": "Manage Applicants",
  "/admin/verifications": "Pending Verifications",
  "/admin/users": "Manage Users",
  "/admin/analytics": "Analytics",
};
