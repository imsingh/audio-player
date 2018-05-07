import { Component, ViewChild } from "@angular/core";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";

import {
  NavController,
  NavParams,
  Navbar,
  Content,
  LoadingController
} from "ionic-angular";

import { AudioProvider } from "../../providers/audio/audio";
import { FormControl } from "@angular/forms";
import {
  CANPLAY,
  LOADEDMETADATA,
  PLAYING,
  TIMEUPDATE,
  LOADSTART,
  RESET
} from "../../providers/store/store";
import { Store } from "@ngrx/store";
import { CloudProvider } from "../../providers/cloud/cloud";
import { AuthService } from "../..//providers/auth0/auth.service";
import { pluck, filter, map, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "page-home",
  templateUrl: "home.html",
  animations: [
    trigger("showHide", [
      state(
        "active",
        style({
          opacity: 1
        })
      ),
      state(
        "inactive",
        style({
          opacity: 0
        })
      ),
      transition("inactive => active", animate("250ms ease-in")),
      transition("active => inactive", animate("250ms ease-out"))
    ])
  ]
})
export class HomePage {
  files: any = [];
  seekbar: FormControl = new FormControl("seekbar");
  state: any = {};
  onSeekState: boolean;
  currentFile: any = {};
  displayFooter: string = "inactive";
  loggedIn: Boolean;
  @ViewChild(Navbar) navBar: Navbar;
  @ViewChild(Content) content: Content;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public audioProvider: AudioProvider,
    public loadingCtrl: LoadingController,
    public cloudProvider: CloudProvider,
    private store: Store<any>,
    public auth: AuthService
  ) {
    this.auth.isLoggedIn$.subscribe((isLoggedIn: any) => {
      this.loggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.getDocuments();
      }
    });
  }

  getDocuments() {
    let loader = this.presentLoading();
    this.cloudProvider.getFiles().subscribe(files => {
      this.files = files.filter(
        file =>
          file.contentType !== "application/x-www-form-urlencoded;charset=UTF-8"
      );
      loader.dismiss();
    });
  }

  login() {
    this.auth
      .login()
      .then(() => {
        console.log("Successful Login");
      })
      .catch(error => {
        console.log(error);
      });
  }

  ionViewWillLoad() {
    // Listening to Store events and update the state
    this.store.select("appState").subscribe((value: any) => {
      this.state = value.media;
    });

    // Resize the Content Screen so that Ionic is aware of footer
    this.store
      .select("appState")
      .pipe(pluck("media", "canplay"), filter(value => value === true))
      .subscribe(value => {
        this.displayFooter = "active";
        this.content.resize();
      });

    // Updating the Seekbar based on currentTime
    this.store
      .select("appState")
      .pipe(
        pluck("media", "timeSec"),
        filter(value => value !== undefined),
        map((value: any) => Number.parseInt(value)),
        distinctUntilChanged()
      )
      .subscribe((value: any) => {
        this.seekbar.setValue(value);
      });
  }

  openFile(file, index) {
    this.currentFile = { index, file };
    let url = `https://storage.googleapis.com/${file.bucket}/${file.name}`;
    this.playStream(url);
  }

  playStream(url) {
    this.resetState();
    this.audioProvider.playStream(url).subscribe(event => {
      const audioObj = event.target;
      if (event.type === "canplay") {
        this.store.dispatch({ type: CANPLAY, payload: { value: true } });
      } else if (event.type === "loadedmetadata") {
        this.store.dispatch({
          type: LOADEDMETADATA,
          payload: {
            value: true,
            data: {
              time: this.audioProvider.formatTime(
                audioObj.duration * 1000,
                "HH:mm:ss"
              ),
              timeSec: audioObj.duration,
              mediaType: "mp3"
            }
          }
        });
      } else if (event.type === "playing") {
        this.store.dispatch({ type: PLAYING, payload: { value: true } });
      } else if (event.type === "pause" || event.type === "ended") {
        this.store.dispatch({ type: PLAYING, payload: { value: false } });
      } else if (event.type === "timeupdate") {
        this.store.dispatch({
          type: TIMEUPDATE,
          payload: {
            timeSec: audioObj.currentTime,
            time: this.audioProvider.formatTime(
              audioObj.currentTime * 1000,
              "HH:mm:ss"
            )
          }
        });
      } else if (event.type === "loadstart") {
        this.store.dispatch({ type: LOADSTART, payload: { value: true } });
      }
    });
  }

  next() {
    let index = this.currentFile.index + 1;
    let file = this.files[index];
    this.openFile(file, index);
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }

  previous() {
    let index = this.currentFile.index - 1;
    let file = this.files[index];
    this.openFile(file, index);
  }

  onSeekStart() {
    this.onSeekState = this.state.playing;
    if (this.onSeekState) {
      this.pause();
    }
  }

  onSeekEnd(event) {
    if (this.onSeekState) {
      this.audioProvider.seekTo(event.value);
      this.play();
    } else {
      this.audioProvider.seekTo(event.value);
    }
  }

  play() {
    this.audioProvider.play();
  }

  pause() {
    this.audioProvider.pause();
  }

  stop() {
    this.audioProvider.stop();
  }

  resetState() {
    this.audioProvider.stop();
    this.store.dispatch({ type: RESET });
  }

  presentLoading() {
    let loading = this.loadingCtrl.create({
      content: "Loading Content. Please Wait..."
    });
    loading.present();
    return loading;
  }

  logout() {
    this.reset();
    this.auth.logout();
  }

  reset() {
    this.resetState();
    this.currentFile = {};
    this.displayFooter = "inactive";
  }
}
