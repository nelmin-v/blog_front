import {Component} from '@angular/core';
import {CoreModule} from 'app/core/core.module';
import {UnSubscriber} from 'app/core/abstract/un-subscriber';
import {FormsModule} from '@angular/forms';
import {DeviceDetectorService} from 'ngx-device-detector';
import {LineComponent} from "app/pages/widgets/line/line.component";
import {AuthService} from "app/core/service/auth/auth.service";
import {animations} from "app/core/config/app.animations";
import {Router, RouterOutlet} from "@angular/router";
import {FooterWidgetComponent} from "app/pages/widgets/footer/footer-widget.component";
import {StoriesComponent} from "app/pages/widgets/stories/stories.component";
import {RightWidgetComponent} from "app/pages/widgets/right/right-widget.component";

@Component({
  selector: 'summary',
  standalone: true,
  animations: animations,
  imports: [
    CoreModule,
    FormsModule,
    LineComponent,
    RouterOutlet,
    FooterWidgetComponent,
    StoriesComponent,
    RightWidgetComponent
  ],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.less',
})
export class SummaryComponent extends UnSubscriber {
  constructor(
    protected authService: AuthService,
    protected router: Router,
    private deviceService: DeviceDetectorService,
  ) {
    super();
  }

  get isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  get hideRightWidget(): boolean {
    return this.isMobile && ( !this.authService.isAuthorized || ["my", "bookmarks"].find(it => this.router.url.includes(it)) != null);
  }
}
