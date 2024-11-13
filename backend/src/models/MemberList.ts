import MemberType from "./MemberType";

class MemberList {
    constructor(
        public id: number,
        public memberId: number,
        public clubId: number,
        public memberType: MemberType
    ){}
}

export default MemberList;