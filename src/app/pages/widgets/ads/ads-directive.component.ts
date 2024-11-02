import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {ThemeDataService} from "../../../core/service/theme-data.service";

@Directive({
  standalone: true,
  selector: '[ads]'
})
export class AdsDirective implements OnInit {

  blockId: string = "R-A-12653519-1";

  constructor(private el: ElementRef, private themeDataService: ThemeDataService) {
  }

  ngOnInit() {
    const div = document.createElement('div');
    div.id = 'yandex_ads';
    this.el.nativeElement.appendChild(div);
    this.el.nativeElement.classList.add('ads');

    const script = document.createElement('script');
    script.text = `
      window.yaContextCb.push(() => {
        Ya.Context.AdvManager.render({
          "blockId"  : "${this.blockId}",
          "renderTo" : "yandex_ads",
          "darkTheme": ${this.themeDataService.isDarkMode}
        })
      });
    `;

    this.el.nativeElement.appendChild(script);
  }
}
