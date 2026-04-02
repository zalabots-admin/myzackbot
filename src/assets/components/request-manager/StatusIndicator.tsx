

import clsx from "clsx";

interface WorkflowStatusIndicatorProps {
  status: string;
  showLabel?: boolean;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

const STATUS_MAP = {
  NEW: { color: "bg-[#505050]", label: "New", pulse: false },
  SENT: { color: "bg-[#003399]", label: "Sent", pulse: false },
  DELIVERED: { color: "bg-[#003399]", label: "Delivered", pulse: false },
  BOUNCED: { color: "bg-[#EB7100]", label: "Bounced", pulse: true },
  EMAIL_OPENED: { color: "bg-[#003399]", label: "Email Opened", pulse: false },
  IN_PROGRESS: { color: "bg-[#4E6E5D]", label: "In Progress", pulse: false },
  PAST_DUE: { color: "bg-[#EB7100]", label: "Past Due", pulse: true },
  EXPIRED: { color: "bg-[#EB7100]", label: "Expired", pulse: true },
  CANCELLED: { color: "bg-[#505050]", label: "Cancelled", pulse: true },
  SUBMITTED: { color: "bg-[#003399]", label: "Submitted", pulse: false },
  DRAFT: { color: "bg-[#505050]", label: "Draft", pulse: false },
  REQUESTED: { color: "bg-[#003399]", label: "Requested", pulse: false },
  ACTIVE: { color: "bg-[#4E6E5D]", label: "Active", pulse: false },
  CLOSED: { color: "bg-[#505050]", label: "Closed", pulse: false },
  PENDING : { color: "bg-[#4E6E5D]", label: "Pending", pulse: false },
  COMPLETED : { color: "bg-[#003399]", label: "Completed", pulse: false },
  WAIVED : { color: "bg-[#EB7100]", label: "Waived", pulse: true },
} as const;

const DEFAULT_STATUS = {
  color: "bg-gray-400",
  label: "Unknown",
  pulse: false,
};

export const WorkflowStatusIndicator = ({
  status,
  showLabel = true,
  //pulse = false,
  size = "lg",
}: WorkflowStatusIndicatorProps) => {
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, "_");

  const { color, label, pulse } =
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
