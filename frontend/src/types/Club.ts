import { ClubType } from "./ClubType";

export type Club = {
  id: number;
  name: string;
  email: string;
  description: string;
  shortdescription: string;
  image: string;
  headerimage: string;
  university: string;
  latitude: string;
  longitude: string;
  clubtype: ClubType;
  popularity: number;
  ratio: number;
};

export type ClubResp = Omit<Club, "longitude" | "latitude">;
