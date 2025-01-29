import { TicketType } from "../TicketType";

export type Ticket = {
  id: number;
  eventId: number;
  name: string;
  price: number;
  tickettype: TicketType;
};
