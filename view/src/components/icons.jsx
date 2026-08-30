const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const ArrowLeftIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const BookmarkIcon = ({ filled, ...props }) => (
  <svg {...base} fill={filled ? "currentColor" : "none"} {...props}>
    <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const XIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const ChevronDownIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronUpIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

export const BellIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const SearchIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const PersonOffIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M2 2l20 20" />
    <path d="M9 9a3 3 0 0 0 4.24 4.24M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4c.5 0 .98.08 1.43.23" />
  </svg>
);

export const CheckCircleIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const InfoIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export const WarningIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
  </svg>
);

export const FactCheckIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="m8 12 2 2 4-4M8 17h4" />
  </svg>
);

export const ClipboardIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
  </svg>
);

export const FilterIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 4h16l-6 8v6l-4 2v-8z" />
  </svg>
);

export const UploadIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 16V4M6 10l6-6 6 6" />
    <path d="M4 20h16" />
  </svg>
);

export const MenuIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const DocumentIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M9 13h6M9 17h6" />
  </svg>
);

export const ClockIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export const BuildingIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="2" width="16" height="20" rx="1" />
    <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1M10 22v-4h4v4" />
  </svg>
);

export const UsersIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
    <circle cx="18" cy="9" r="3" />
    <path d="M22 21v-1a5 5 0 0 0-4-4.9" />
  </svg>
);

export const ShieldIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
    <path d="m9.5 12 2 2 3.5-3.5" />
  </svg>
);

export const ChartIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 16v-4M12 16V8M17 16v-7" />
  </svg>
);

export const SparkleIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const QuestionIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 1.7-2.4 3.4" />
    <path d="M12 17.5h.01" />
  </svg>
);

export const ActivityIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const GridIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
