import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import * as moment from 'moment';

@Injectable()
export class AudioProvider {
  private stop$ = new Subject();
  private audioObj = new Audio();

  constructor() {}

  playStream(url) {
    return this.streamObservable(url).takeUntil(this.stop$);
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
      "ended",
      "error",
      "play",
      "playing",
      "pause",
      "timeupdate",
      "canplay",
      "loadedmetadata",
      "loadstart"
    ];
    let handlers = [];

    let eventAdder = function(obj, events, observer) {
      let handlers = [];
      events.forEach(eventName => {
        let handler = event => observer.next({ eventName, event });
        obj.addEventListener(eventName, handler);
        handlers.push({ eventName, handler });
      });

      return handlers;
    };

    let eventRemover = function(obj, handlers) {
      handlers.forEach(event => {
        obj.removeEventListener(event.eventName, event.handler);
      });
    };

    return Observable.create(observer => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      // Media Events
      handlers = eventAdder(this.audioObj, events, observer);

      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;

        // Remove EventListeners
        eventRemover(this.audioObj, handlers);
      };
    });
  }

  formatTime(time, format) {
    return moment.utc(time).format(format);
  }
}
