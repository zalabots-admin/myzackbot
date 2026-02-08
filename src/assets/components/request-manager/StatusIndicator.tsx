

import clsx from "clsx";

interface WorkflowStatusIndicatorProps {
  status: string;
  showLabel?: boolean;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

const STATUS_MAP = {
  NEW: { color: "bg-slate-400", label: "New" },
  SENT: { color: "bg-blue-400", label: "Sent" },
  DELIVERED: { color: "bg-blue-600", label: "Delivered" },
  EMAIL_OPENED: { color: "bg-indigo-500", label: "Email Opened" },
  IN_PROGRESS: { color: "bg-yellow-500", label: "In Progress" },
  PAST_DUE: { color: "bg-orange-500", label: "Past Due" },
  EXPIRED: { color: "bg-amber-700", label: "Expired" },
  CANCELLED: { color: "bg-red-500", label: "Cancelled" },
  SUBMITTED: { color: "bg-emerald-600", label: "Submitted" },
  DRAFT: { color: "bg-gray-400", label: "Draft" },
  REQUESTED: { color: "bg-blue-500", label: "Requested" },
  ACTIVE: { color: "bg-green-500", label: "Active" },
  CLOSED: { color: "bg-gray-500", label: "Closed" },
} as const;

const DEFAULT_STATUS = {
  color: "bg-gray-400",
  label: "Unknown",
};

export const WorkflowStatusIndicator = ({
  status,
  showLabel = true,
  pulse = false,
  size = "lg",
}: WorkflowStatusIndicatorProps) => {
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, "_");

  const { color, label } =
    STATUS_MAP[normalizedStatus as keyof typeof STATUS_MAP] ??
    DEFAULT_STATUS;

  return (
    <div className="flex items-center gap-2">
      <span
        className={clsx(
          "relative inline-flex rounded-full",
          color,
          size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3.5 w-3.5" : "h-4.5 w-4.5",
          pulse &&
            "after:absolute after:inset-0 after:rounded-full after:animate-ping after:bg-inherit after:opacity-70"
        )}
        aria-label={label}
      />

      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
    </div>
  );
};
