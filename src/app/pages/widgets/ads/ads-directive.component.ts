import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[ads]'
})
export class AdsDirective implements OnInit {
  @Input()
  blockId: string = "R-A-12653519-1";

  constructor(private el: ElementRef) {}

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
          "darkTheme": false
        })
      });
    `;

    this.el.nativeElement.appendChild(script);
  }
}
