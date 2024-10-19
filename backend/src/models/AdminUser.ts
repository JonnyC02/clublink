class AdminUser extends User {
    constructor(
      id: number,
      name: string,
      email: string,
      isActive: boolean,
      clubs: number[],
      public role: string,
      isStudent?: boolean,
      studentNumber?: number
    ) {
      super(id, name, email, isActive, clubs, isStudent, studentNumber);
    }
  }
  