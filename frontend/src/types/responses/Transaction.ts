export type Transaction = {
  id: number;
  memberid: number;
  ticketid: number;
  amount: number;
  clubid: number;
  status: string;
  type: string;
  time: Date;
  promocode: string;
  updated_at: Date;
  transactiontype: boolean;
};
