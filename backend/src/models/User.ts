class User {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public isActive: boolean,
        public university?: string,
        public studentNumber?: number,
        public isSuperAdmin?: boolean,
    ) { }
}

export default User;