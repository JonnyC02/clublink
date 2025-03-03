class Ticket {
  constructor(
    public id: number,
    public eventId: number,
    public name: string,
    public price: number,
    public date: string
  ) {}
}

export default Ticket;
