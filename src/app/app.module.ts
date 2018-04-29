import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ErrorHandler, NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { JwtModule, JWT_OPTIONS } from "@auth0/angular-jwt";
import { StoreModule } from "@ngrx/store";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { mediaStateReducer } from "../providers/store/store";
import { AudioProvider } from "../providers/audio/audio";
import { CloudProvider } from "../providers/cloud/cloud";

import { MyApp } from "./app.component";
import { HomePage } from "../pages/home/home";
import { TrimNamePipe } from "../pipes/trim-name/trim-name";
import { AuthService } from "../providers/auth0/auth.service";
import { IonicStorageModule, Storage } from "@ionic/storage";

export function jwtOptionsFactory(storage) {
  return {
    tokenGetter: () => {
      console.log(storage.get("access_token"));
      return storage.get("access_token");
    },
    whitelistedDomains: [
      "wt-3a798f13259d542814174ba32c1e8bf1-0.sandbox.auth0-extend.com"
    ]
  };
}

@NgModule({
  declarations: [MyApp, HomePage, TrimNamePipe],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [Storage]
      }
    }),
    IonicStorageModule.forRoot(),
    StoreModule.forRoot({
      appState: mediaStateReducer
    }),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    StatusBar,
    SplashScreen,
    AudioProvider,
    CloudProvider,
    AuthService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
