import {Component, OnInit} from '@angular/core';
import {CoreModule} from 'app/core/core.module';
import {UnSubscriber} from 'app/core/abstract/un-subscriber';
import {AuthService} from 'app/core/service/auth/auth.service';
import {Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {ThemeDataService} from "app/core/service/theme-data.service";
import { animations } from 'app/core/config/app.animations';

@Component({
  selector: 'top-menu',
  standalone: true,
  animations: animations,
  imports: [CoreModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.less',
})
export class MenuComponent extends UnSubscriber implements OnInit {

  constructor(
    protected authService: AuthService,
    protected router: Router,
    protected themeDataService: ThemeDataService,
    protected deviceService: DeviceDetectorService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.themeDataService.init();
  }

  get hideSearchButton(): boolean {
    return this.router.url.includes('/search');
  }

  get isMobile(): boolean {
    return this.deviceService.isMobile();
  }
}
