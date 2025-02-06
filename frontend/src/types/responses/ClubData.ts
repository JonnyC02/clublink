import { AuditLog } from "../AuditLog";
import { ClubResp } from "../Club";
import { Member } from "../Member";
import { Ticket } from "./TicketData";

export type ClubData = {
  Club: ClubResp;
  MemberList: Member[];
  AuditLog: AuditLog[];
  ismember: boolean;
  hasPending: boolean;
  Tickets: Ticket[];
};
