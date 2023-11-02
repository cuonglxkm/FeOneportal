import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ValidatorsRuleService } from './validators-rule.service';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {
  constructor(private vrService: ValidatorsRuleService) {}

  // email verification
  public emailValidator(): ValidatorFn | null {
    return this.commonUtil(this.vrService.emailRule);
  }

  // phone number verification
  public mobileValidator(): ValidatorFn | null {
    return this.commonUtil(this.vrService.mobileRule);
  }

  // password verification
  public passwordValidator(): ValidatorFn | null {
    return this.commonUtil(this.vrService.passwordRule);
  }

  // phone number validation
  public telephoneValidator(): ValidatorFn {
    return this.commonUtil(this.vrService.telPhoneRule);
  }

  private commonUtil(ruleFun: (value: string) => ValidationErrors | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return ruleFun(control.value);
    };
  }
}
