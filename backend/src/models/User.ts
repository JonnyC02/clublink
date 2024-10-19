class User {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public isActive: boolean,
        public clubs: number[],
        public isStudent?: boolean,
        public studentNumber?: number
    ) {}
} 