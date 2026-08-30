export default function Letterhead({ subtitle, as: Tag = "h1", compact = false }) {
  return (
    <div className={compact ? "letterhead letterhead-compact" : "letterhead"}>
      <div className="letterhead-mark">UA</div>
      <div>
        <Tag className="letterhead-title">UniApply</Tag>
        {subtitle && <p className="letterhead-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
