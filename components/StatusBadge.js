import { STATUS_CONFIG } from "@/lib/dataStore";

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: "#6B7280",
    bg: "#F3F4F6",
    text: "#374151",
  };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.color}30`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: config.color }}
      ></span>
      {config.label}
    </span>
  );
}
