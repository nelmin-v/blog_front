import {Component, OnInit} from '@angular/core';
import {CoreModule} from 'app/core/core.module';
import {UnSubscriber} from 'app/core/abstract/un-subscriber';
import {DeviceDetectorService} from 'ngx-device-detector';
import {takeUntil} from "rxjs";
import {animations} from "app/core/config/app.animations";
import {LineType, lineTypes} from "app/core/service/line/line.service";
import {AuthService} from "app/core/service/auth/auth.service";
import {Router} from "@angular/router";
import {TagService} from "app/core/service/content/tag.service";

@Component({
  selector: 'right-widget',
  standalone: true,
  animations: animations,
  imports: [CoreModule],
  templateUrl: './right-widget.component.html',
  styleUrl: './right-widget.component.less',
})
export class RightWidgetComponent extends UnSubscriber implements OnInit {

  protected state: 'data' | 'loading' | 'empty' = 'loading';
  protected currentType: LineType = LineType.top;
  protected readonly lineTypes = lineTypes;

  constructor(
    protected tagService: TagService,
    private deviceService: DeviceDetectorService,
    protected authService: AuthService,
    protected router: Router,
  ) {
    super();
  }

  public tags: Array<string> = [];

  get isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  ngOnInit(): void {

    try {
      let url = this.router.url.replace('/', '');
      this.currentType = url != '' ? url as LineType : LineType.top;
    } catch (e) {
      this.currentType = LineType.top;
    }

    if (!this.isMobile) {
      this.tagService.suggestions()
        .pipe(takeUntil(this.unSubscriber))
        .subscribe({
          next: it => {
            it.forEach((it) => {
              this.tags.push(it.value);
            });

            this.tags.sort((a, b) => a.length - b.length);

            this.state = 'data';
          },
          error: () => this.state = 'data'
        });

      let date = new Date();
      date.setDate(date.getDate() - 7);
    } else {
      this.state = 'data';
    }
  }

  protected changeType(type: LineType) {
    this.currentType = type;
    this.router.navigate([type]).then();
  }

  resolveIcon(item: LineType) {

    switch (item) {
      case LineType.top:
        return 'local_fire_department';
      case LineType.my:
        return 'description';
      case LineType.subscriptions:
        return 'recent_actors';
    }

    return item.toLowerCase();
  }
}
