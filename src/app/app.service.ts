import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Song } from './models/Song';
import { Config } from './models/Config';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private config: Config | null = null;
  constructor(private http: HttpClient) { }

  public getJSON(): Observable<Config> {
    return this.http.get<Config>("./assets/heardle.json");
  }

  public load(callback?: Function): void {
    if (this.config) {
      if (callback) callback();
      return;
    }

    this.getJSON().subscribe({
      next: (value) => {
        this.config = value;
        if (callback) callback();
      },
    });
  }

  public getArtistName(): string {
    if (!this.config) throw "Config not loaded yet!";
    return this.config?.artistName;
  }

  public getGuessMap(): number[] {
    if (!this.config) throw "Config not loaded yet!";
    return this.config?.guessMap;
  }

  public getMaxGuesses(): number {
    if (!this.config) throw "Config not loaded yet!";
    return this.config?.guessMap.length;
  }

  public getStartDate(): string {
    if (!this.config) throw "Config not loaded yet!";
    return this.config?.startDate;
  }

  public getSongs(): Song[] {
    if (!this.config) throw "Config not loaded yet!";
    return this.config?.songs;
  }

}