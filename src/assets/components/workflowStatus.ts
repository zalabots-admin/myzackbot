

export type WorkflowStatus =
  | "NEW"
  | "SENT"
  | "DELIVERED"
  | "EMAIL_OPENED"
  | "IN_PROGRESS"
  | "PAST_DUE"
  | "EXPIRED"
  | "CANCELLED"
  | "SUBMITTED";