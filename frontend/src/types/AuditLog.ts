export type AuditLog = {
  id: number;
  member: string;
  user: string;
  actionType: string;
  created_at: Date;
};
