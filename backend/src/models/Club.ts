class Club {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public description: string,
        public shortDescription: string,
        public members: number[],
        public committeeMembers: number[],
        public image: string,
    ) {}
}