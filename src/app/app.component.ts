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

  public gameDay: number | null = null;

  public won = false;
  public tries = 0;

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

      const songList = this.api.getSongs();
      this.song = songList[Math.floor(Math.random() * songList.length)];
      this.gameDay = Math.floor((new Date().getTime() - new Date(this.api.getStartDate()).getTime()) / 1000 / 60 / 60 / 24);
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
    if (scores.hasOwnProperty(this.gameDay)) {
      this.won = true;
      if (this.gameDay) this.tries = scores[this.gameDay];
    }
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
}