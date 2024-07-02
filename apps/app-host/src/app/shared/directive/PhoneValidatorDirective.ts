import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[appPhoneValidator]',
})
export class PhoneValidatorDirective implements Validator {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && (value.startsWith('0') && value.length > 10)) {
      return { 'maxlength': { requiredLength: 10, actualLength: value.length } };
    }
    if (value && (value.startsWith('8') && value.length > 11)) {
      return { 'maxlength': { requiredLength: 11, actualLength: value.length } };
    }
    return null;
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.startsWith('0')) {
      this.renderer.setAttribute(this.el.nativeElement, 'maxlength', '10');
    } else if (input.value.startsWith('8')) {
      this.renderer.setAttribute(this.el.nativeElement, 'maxlength', '11');
    } else {
      this.renderer.setAttribute(this.el.nativeElement, 'maxlength', '10');
    }
  }
}
