import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';
@Directive({
  standalone: true,
  selector: '[appTrim]'
})
export class TrimDirective {

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string) {
    const trimmedValue = value.trim();
    this.control.control?.setValue(trimmedValue);
  }
}
