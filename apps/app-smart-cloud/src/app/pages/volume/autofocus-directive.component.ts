import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    setTimeout(() => this.el.nativeElement.focus(), 1000);

  }

}
