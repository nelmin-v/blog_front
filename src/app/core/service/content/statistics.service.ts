import {Injectable} from "@angular/core";
import {HttpMethod, HttpSenderService} from "app/core/service/base/http-sender.service";
import {Observable} from "rxjs";
import {Statistics} from "./statistics";

@Injectable({
  providedIn: 'any'
})
export class StatisticsService {

  constructor(private httpSender: HttpSenderService) {}

  get(): Observable<Statistics> {
    return this.httpSender.send(HttpMethod.GET, '/statistic');
  }

  getList(list: Array<string>): Observable<Array<Statistics>> {
    return this.httpSender.send(HttpMethod.POST, '/statistic/list', list);
  }
}
