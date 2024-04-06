import { AfterViewInit, Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from './app.service';
import { Guess } from './models/Guess';
import { Song } from './models/Song';

declare var SC: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('track') track: ElementRef | null = null;
  
  constructor (
    private api: AppService,
    private cdr: ChangeDetectorRef
  ) { }
  public input: string = "";

  public guesses: Guess[] = [];
  public playing: boolean = false;

  public artistName: string = "";
  public widget: any = null;

  public guessMap: number[] = [];

  public autocompletes: string[] = [];
  public autocompleteVisible: boolean = false;

  public song: Song | null = null;
  
  public localStorageKey: string | null = null;

  public gameDay: number = -1;

  public won = false;
  public tries = 0;

  public imgUrl = "";

  public getEmoji(guess: Guess): string {
    if (guess.skipped) return "⏩";
    if (this.song && guess.guess && guess.guess?.toLowerCase().replace(/\s/g, "") === this.song?.title.toLowerCase().replace(/\s/g, "")) return "✅";
    return "❌";
  }

  public ngAfterViewInit(): void {
    this.widget = SC.Widget("iframe");
    this.api.load(() => {
      this.guesses = new Array(this.api.getMaxGuesses());
      this.artistName = this.api.getArtistName();
      this.guessMap = this.api.getGuessMap();

      this.widget.bind("playProgress", (progress: any) => {
        const ratio = progress.currentPosition / this.api.getGuessMap()[this.api.getMaxGuesses() - 1];
        if (this.track) this.track.nativeElement.style.width = `${this.playing ? 100 * ratio : 0}%`;
        const maxTime = this.api.getGuessMap()[
          Math.min(this.getCurrentGuess(), this.api.getMaxGuesses() - 1)
        ];
        if (progress.currentPosition > maxTime) {
          this.playing = false;
          this.widget.pause();
          this.cdr.detectChanges();
        }
      });

      this.gameDay = Math.floor((new Date().getTime() - new Date(this.api.getStartDate()).getTime()) / 1000 / 60 / 60 / 24);
      this.song = this.getSongForDay(this.gameDay);
      this.widget.load(this.song.url);
      
      this.localStorageKey = `heardle-${this.artistName.toLowerCase().replace(/\s/g, "")}`;
      this.checkWin();
    });
  }

  public submit(): void {
    if (this.isStringEmpty(this.input) || this.getCurrentGuess() >= this.api.getMaxGuesses()) return;
    this.guesses[this.getCurrentGuess()] = {
      guess: this.input,
      skipped: false,
    };
    if (this.getCurrentGuess() === this.api.getMaxGuesses()) {
      const scores = this.getData("scores") ?? {};
      if (this.gameDay !== null) scores[this.gameDay] = -1;
      this.setData("scores", scores);
      this.checkWin();
      return;
    }
    if (this.input.toLowerCase().replace(/\s/g, "") === this.song?.title.toLowerCase().replace(/\s/g, "")) {
      const scores = this.getData("scores") ?? {};
      if (this.gameDay !== null) scores[this.gameDay] = this.getCurrentGuess() - 1;
      this.setData("scores", scores);
      this.checkWin();
    }
    this.input = "";
  }
  public skip(): void {
    if (this.getCurrentGuess() >= this.api.getMaxGuesses()) return;
    this.guesses[this.getCurrentGuess()] = {
      guess: null,
      skipped: true,
    };
    if (this.getCurrentGuess() === this.api.getMaxGuesses()) {
      const scores = this.getData("scores") ?? {};
      if (this.gameDay !== null) scores[this.gameDay] = -1;
      this.setData("scores", scores);
      this.checkWin();
      return;
    }
  }
  public clear(): void {
    this.input = "";
    this.updateAutocomplete();
  }

  public getCurrentGuess(): number {
    if (this.won) return this.api.getMaxGuesses();
    const index = this.guesses.findIndex(x => !x);
    return index === -1 ? this.api.getMaxGuesses() : index;
  }

  private isStringEmpty(str: string): boolean {
    return !str || str.replace(/\s/g, "").length === 0;
  }

  public togglePlayer() {
    if (!this.playing) {
      this.widget.seekTo(0);
      this.widget.play();
    } else {
      this.widget.pause();
      this.widget.seekTo(0);
    }
    this.playing = !this.playing;
  }

  public updateAutocomplete(): void {
    if (this.isStringEmpty(this.input)) {
      this.autocompletes = [];
      return;
    }
    this.autocompletes = this.api.getSongs().map(x => x.title).filter(x => 
      x.toLowerCase().replace(/\s/g, "").includes(this.input.toLowerCase().replace(/\s/g, ""))
    ).slice(0, 10);
  }

  public createBlurListener(): void {
    window.addEventListener("mouseup", () => {
      window.setTimeout(() => this.autocompleteVisible = false, 1);
    }, { once: true, });
  }

  public checkWin(): void {
    const scores = this.getData("scores");
    if (!scores) return;
    if (scores.hasOwnProperty(this.gameDay)) {
      this.won = true;
      this.tries = scores[this.gameDay.toString()];
    }
    const imgMap = this.api.getImageMap();
    const possibleImages = imgMap[this.tries === -1 ? imgMap.length - 1 : this.tries];
    this.imgUrl = possibleImages[Math.floor(Math.random() * possibleImages.length)];
  }

  public setData(key: string, value: any): void {
    if (!this.localStorageKey) return;
    else {
      const json = localStorage.getItem(this.localStorageKey)
      const data = JSON.parse(json ?? "{}") ?? {};
      data[key] = value;
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    }
  }
  public getData(key: string): any {
    if (!this.localStorageKey) return;
    else {
      const json = localStorage.getItem(this.localStorageKey)
      const data = JSON.parse(json ?? "{}") ?? {};
      return data[key];
    }
  }
  public deleteData(key: string): void {
    if (!this.localStorageKey) return;
    else {
      const json = localStorage.getItem(this.localStorageKey)
      const data = JSON.parse(json ?? "{}") ?? {};
      delete data[key];
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    }
  }

  public getSongForDay(day: number): Song {
    const seed = (day + 1) * 13;
    const random = {
      m: 0x80000000,
      a: 1103515245,
      c: 12345,
      state: seed ? seed : Math.floor(Math.random() * (0x80000000 - 1)),
      nextFloat: function() {
        // Generate the next integer value
        this.state = (this.a * this.state + this.c) % this.m;
        
        // Normalize the integer value to the range [0,1]
        return this.state / this.m;
      },
    };

    const songs = this.api.getSongs();
    const song = songs[Math.floor(random.nextFloat() * songs.length)];
    return song;
  }

  public share(): void {
    if (!navigator || !navigator.clipboard) {
      alert("An error occurred while copying the text.");
      return;
    }
    try {
      let text = `${this.artistName} Heardle #${this.gameDay + 1}\n`;
      if (this.tries === -1) for(let i = 0; i < this.api.getMaxGuesses(); i++) text += "❌";
        else {for(let i = 0; i < this.tries; i++) {
          text += "❌";
        }
        text += "✅";
      }
      text += `\n\n${window.location.href}`;
      navigator.clipboard.writeText(text);
      alert("Text copied!");
    } catch (e) {
      alert("An error occurred while copying the text.");
      console.error(e);
    }
  }
}