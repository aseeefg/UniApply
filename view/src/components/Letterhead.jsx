export default function Letterhead({ subtitle }) {
  return (
    <div className="letterhead">
      <div className="letterhead-mark">UA</div>
      <div>
        <h1 className="letterhead-title">UniApply</h1>
        {subtitle && <p className="letterhead-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
