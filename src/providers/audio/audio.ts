import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as moment from "moment";

@Injectable()
export class AudioProvider {
  private stop$ = new Subject();
  private audioObj = new Audio();

  constructor() {}

  playStream(url) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }

  stop() {
    this.stop$.next();
  }

  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }
  pause() {
    this.audioObj.pause();
  }

  play() {
    this.audioObj.play();
  }

  private streamObservable(url) {
    let events = [
      "ended", "error", "play", "playing", "pause", "timeupdate", "canplay", "loadedmetadata", "loadstart"
    ];
  
    const addEvents = function(obj, events, handler) {
      events.forEach(event => {
        obj.addEventListener(event, handler);
      });
    };

    const removeEvents = function(obj, events, handler) {
      events.forEach(event => {
        obj.removeEventListener(event, handler);
      });
    }

    return Observable.create(observer => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      // Media Events
      const handler = (event) => observer.next(event);
      addEvents(this.audioObj, events, handler);

      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;

        // Remove EventListeners
        removeEvents(this.audioObj, events, handler);
      };
    });
  }

  formatTime(time, format) {
    return moment.utc(time).format(format);
  }
}
