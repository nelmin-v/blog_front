import {Component, OnInit} from '@angular/core';
import {RootModule} from 'app/root.module';
import {DeviceDetectorService} from 'ngx-device-detector';
import {AuthService} from "app/core/service/auth/auth.service";
import {UnSubscriber} from "app/core/abstract/un-subscriber";
import {delay, of, retry, RetryConfig, takeUntil} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'bad-gateway',
  standalone: true,
  imports: [RootModule],
  templateUrl: './bad-gateway.component.html',
  styleUrl: './bad-gateway.component.less',
})
export class BadGatewayComponent extends UnSubscriber implements OnInit {
  constructor(
    private deviceService: DeviceDetectorService,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }

  get isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  ngOnInit(): void {
    this.authService.getState()
      .pipe(
        takeUntil(this.unSubscriber),
        retry({
          count: 60,
          delay: (err: any, number: number) => {

            if (err) {
              return of(true).pipe(delay(2500),);
            }

            return of(undefined);
          }
        } as RetryConfig),
      )
      .subscribe(it => this.router.navigate(['/']));
  }


}