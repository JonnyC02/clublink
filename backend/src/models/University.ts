class University {
    constructor(
        public id: number,
        public acronym: string,
        public name: string,
        public superAdminIds: number[],
        public email: string,
    ) { }
}

export default University;