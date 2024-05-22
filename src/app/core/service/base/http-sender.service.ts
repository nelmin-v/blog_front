import {Injectable, OnInit} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {Sender} from "app/abstract/sender";

export enum HttpMethod {
  GET = "GET",
  POST = "POST"
}

@Injectable()
export class HttpSenderService implements OnInit, Sender {

  protected options: any = {};

  constructor(protected httpClient: HttpClient) {
  }

  ngOnInit(): void {
    let defaultHeaders = new HttpHeaders();
    defaultHeaders.append('Content-Type', 'application/json');
    this.options = {headers: defaultHeaders};
  }

  send(httpMethod: HttpMethod, url: string, body?: any) : Observable<any> {

    if (httpMethod == HttpMethod.GET) {
      return this.get(url);
    }

    if (httpMethod == HttpMethod.POST) {
      return this.post(url, body);
    }

    return of({});
  }

  private post(url: string, body: any): Observable<any> {
    return this.httpClient.post('/api' + url, body, this.options);
  }

  private get(url: string): Observable<any> {
    return this.httpClient.get('/api' + url, this.options);
  }
}
