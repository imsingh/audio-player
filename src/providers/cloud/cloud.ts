import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CloudProvider {
  url: string = "https://wt-3a798f13259d542814174ba32c1e8bf1-0.sandbox.auth0-extend.com/google-cloud";
  constructor(private http: HttpClient) {}
  
  getFiles() {
    const url = `${this.url}/media`;
    return this.http.get(url)
      .pipe(
        map((data: any) => { 
          return data.apiResponse.items.filter(file => {
            return file.contentType !== "application/x-www-form-urlencoded;charset=UTF-8"
          });
        })
      );
  }
}
