export default function DashboardCard({ title, icon: Icon, action, children }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-seal/10 text-seal shrink-0">
              <Icon width={16} height={16} />
            </span>
          )}
          <h3 className="text-[0.95rem] font-semibold text-ink m-0">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5 flex-1 flex flex-col gap-3">{children}</div>
    </div>
  );
}
