import { CheckCircleIcon, WarningIcon, InfoIcon, XIcon } from "./icons";

const ICONS = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: WarningIcon,
};

export default function Alert({ variant = "info", title, children, onDismiss }) {
  const Icon = ICONS[variant] || InfoIcon;
  return (
    <div className={`alert alert-${variant}`} role="status">
      <Icon className="alert-icon" width={18} height={18} />
      <div style={{ flex: 1 }}>
        {title && <p className="alert-title">{title}</p>}
        <p className="alert-message">{children}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 0 }}
        >
          <XIcon width={14} height={14} />
        </button>
      )}
    </div>
  );
}
