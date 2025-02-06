import { ticketExpiry } from "../TicketExpiry";
import { TicketFlag } from "../TicketFlag";
import { TicketType } from "../TicketType";

export type Ticket = {
  id: number;
  eventId: number;
  name: string;
  price: number;
  tickettype: TicketType;
  ticketflag: TicketFlag;
  ticketexpiry: ticketExpiry;
};
