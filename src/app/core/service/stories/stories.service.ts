import {Injectable} from "@angular/core";
import {HttpSenderService} from "app/core/service/base/http-sender.service";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

export interface Story {
  id: number;
  title: string;
  description: string;
  link: string;
  lang: string;
}

@Injectable({
  providedIn: 'any'
})
export class StoriesService {

  constructor(
    private httpSender: HttpSenderService,
    private translateService: TranslateService
  ) {
  }

  get lang(): string {
    return this.translateService.getDefaultLang();
  }

  get current(): number {
    let storyId = localStorage.getItem('storyId');

    if (storyId != null) {
      try {
        return Number.parseInt(storyId);
      } catch (ignore) {
      }
    }

    return -1;
  }

  set current(id: number) {
    localStorage.setItem('storyId', id.toString());
  }

  public list(): Observable<Array<Story>> {
    return of([
      {
        id: 1,
        title: 'Результаты осеннего ивента!',
        description: 'Список победителей',
        link: 'event_result',
        lang: 'ru'
      },
      {
        id: 2,
        title: 'Зимний ивент стартует',
        description: 'Новый ивент, новые темы',
        link: 'next_event',
        lang: 'ru'
      }
    ])
    // return this.httpSender.send(HttpMethod.GET, '/stories/list?lang=' + this.lang);
  }
}
