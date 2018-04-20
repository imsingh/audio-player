// src/services/auth.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Storage } from '@ionic/storage';

// Import AUTH_CONFIG, Auth0Cordova, and auth0.js
import { AUTH_CONFIG } from './auth.config';
import Auth0Cordova from '@auth0/cordova';
import * as auth0 from 'auth0-js';

@Injectable()
export class AuthService {
  Auth0 = new auth0.WebAuth(AUTH_CONFIG);
  Client = new Auth0Cordova(AUTH_CONFIG);
  accessToken: string;
  user: any;
  loggedIn: boolean;
  loading = true;

  constructor(
    public zone: NgZone,
    private storage: Storage
  ) {
    this.storage.get('profile').then(user => this.user = user);
    this.storage.get('access_token').then(token => this.accessToken = token);
    this.storage.get('expires_at').then(exp => {
      this.loggedIn = Date.now() < JSON.parse(exp);
      this.loading = false;
    });
  }

  login() {
    const promise = new Promise((resolve, reject) => {
      this.loading = true;
      const options = {
        scope: 'openid profile offline_access'
      };
      // Authorize login request with Auth0: open login page and get auth results
      this.Client.authorize(options, (err, authResult) => {
        if (err) {
          this.loading = false;
          reject(err);
        } else {
            // Set access token
            this.storage.set('access_token', authResult.accessToken);
            this.accessToken = authResult.accessToken;
            // Set access token expiration
            const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
            this.storage.set('expires_at', expiresAt);
            // Set logged in
            this.loading = false;
            this.loggedIn = true;
            resolve();
        }
      
      });
    });

    return promise;
   
  }

  logout() {
    this.storage.remove('profile');
    this.storage.remove('access_token');
    this.storage.remove('expires_at');
    this.accessToken = null;
    this.user = null;
    this.loggedIn = false;
  }
}