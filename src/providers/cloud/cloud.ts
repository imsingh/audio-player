import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/do";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CloudProvider {
  url: string = "https://wt-3a798f13259d542814174ba32c1e8bf1-0.sandbox.auth0-extend.com/google-cloud";
  constructor(private http: HttpClient) {}
  getFiles() {
    const url = `${this.url}/media`;
    return this.http.get(url).map((data: any) => data.apiResponse.items);
  }
}
