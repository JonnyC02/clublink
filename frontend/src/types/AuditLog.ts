export type AuditLog = {
  id: number;
  member: string;
  user: string;
  actiontype: string;
  created_at: Date;
};
