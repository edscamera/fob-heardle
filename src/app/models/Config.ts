import { Song } from "./Song";

export interface Config {
    artistName: string;
    guessMap: number[];
    startDate: string;
    imgMap: string[][];
    songs: Song[];
}