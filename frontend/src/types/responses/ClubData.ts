import { AuditLog } from "../AuditLog";
import { ClubResp } from "../Club";
import { Member } from "../Member";
import { Request } from "../Request";

export type ClubData = {
  Club: ClubResp;
  Requests: Request[];
  MemberList: Member[];
  AuditLog: AuditLog[];
  ismember: boolean;
  hasPending: boolean;
};
