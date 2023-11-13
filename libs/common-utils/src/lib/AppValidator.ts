import {AbstractControl, ValidationErrors} from '@angular/forms';

export class AppValidator {
  // @ts-ignore
  static checkContainSpecialCharactorExceptComma(obj) {
    var regex = /[!`@#$%^&*~()_+\-=\[\]{};':"\\|.<>\/?]+/
    return regex.test(obj)
  }

  // @ts-ignore
  static checkContainSpecialCharactor(obj) {
    var regex = /[!`@#$%^&*~()_+\-=\[\]{};':"\\|,.<>\/?]+/
    return regex.test(obj)
  }

  // @ts-ignore
  static checkContainSpecial2(obj) {
    var regex = /[!`@#$%^&*~()+\-=\[\]{};':"\\|,.<>\/?]+/
    return regex.test(obj)
  }

  // @ts-ignore
  static checkNoWhitespace(obj) {
    return obj.trim().length === 0
  }

  static cannotContainSpecialCharactor(control: AbstractControl): ValidationErrors | null { //ký tự đặc biệt
    if (AppValidator.checkContainSpecialCharactor(control.value) == true) {
      return {containSpecialExceptComma: true};
    }
    return null;
  }

  static cannotContainSpecial(control: AbstractControl): ValidationErrors | null { //ký tự đặc biệt
    if (AppValidator.checkContainSpecial2(control.value) == true) {
      return {containSpecial: true};
    }
    return null;
  }

  static cannotContainSpecialCharactorExceptComma(control: AbstractControl): ValidationErrors | null { //ký tự đặc biệt
    if (AppValidator.checkContainSpecialCharactorExceptComma(control.value) == true) {
      return {containSpecial: true};
    }
    return null;
  }

  static cannotContainNumber(control: AbstractControl): ValidationErrors | null {
    var regex = /^[0-9]/
    if (regex.test(control.value) == false) {
      return {containNumber: true};
    }
    return null;
  }

  static validPhoneNumber(control: AbstractControl): ValidationErrors | null { //valid số điện thoại
    var regexpSDT = new RegExp("^(01|03|05|07|08|09)+(\\d{8})$")
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (control.value != "" && regexpSDT.test(control.value) == false) {
        return {validPhoneNumber: true};
      }
    }
    return null;
  }

  // @ts-ignore
  static validEmail(control: AbstractControl): ValidationErrors | null { //valid email
    var regex = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")
    // var regex = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (regex.test(control.value) == false) {
        return {validEmail: true};
      }
    }
  }

  static noWhitespaceValidator(control: AbstractControl): ValidationErrors | null { //valid không cho nhập khoảng trắng
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      const isWhitespace = AppValidator.checkNoWhitespace(control && control.value && control.value.toString() || '');
      const isValid = !isWhitespace;
      return isValid ? null : {'noWhitespaceValidator': true};
    } else return null;
  }

  static spaceValidator(control: AbstractControl): ValidationErrors | null { //valid không cho nhập khoảng trắng
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (control.value.toString().includes(' ')) {
        return {spaceValidator: true}
      }
    }
    return null;
  }

  static passwordMatchValidator(control: AbstractControl): ValidationErrors | null { //valid nhập lại mật khẩu
    const password = control.get('password')?.value;
    const confirmPass = control.get('confirmPass')?.value;
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      return password === confirmPass ? null : {passwordMatchValidator: true};
    } else return null;
  }

  static currencyValidator(control: AbstractControl): ValidationErrors | null { // valid tiền tối đa 10 chữ số, 2 chữ thap phan
    const regexpCurrency = new RegExp('^\\d{1,10}(?:\\.\\d{0,2})?$');
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      // tslint:disable-next-line:triple-equals
      console.log('currencyValidator', control.value);
      const value = control.value.replace(/,/g, '');
      if (value !== '' && regexpCurrency.test(value) === false) {
        return {validCurrency: true};
      }
    }
    return null;
  }

  static validMST(control: AbstractControl): ValidationErrors | null {
    //var regex = new RegExp("/^\d{10}-\d{3}$/")
    const regex = /^\d{10}-\d{3}$/;
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      const value = control.value.replace(/,/g, '');
      if (value !== '' && regex.test(value) === false) {
        return {validMST: true};
      }
    }
    return null;
  }

  static validPassword(control: AbstractControl): ValidationErrors | null { //
    const regexpCurrency = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*~()_+\-=\[\]{};\\:'"\\|,.<>\/?]).{8,}$/
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      // tslint:disable-next-line:triple-equals
      const value = control.value.replace(/,/g, '');
      if (value !== '' && regexpCurrency.test(value) === false) {
        return {validPasswrod: true};
      }
    }
    return null;
  }

  static validPhoneNumber2(control: AbstractControl): ValidationErrors | null { //valid số điện thoại
    var regexpSDT = /^(\+|0)[0-9]{9,14}$/
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      const value = control.value.replace(/,/g, '');
      if (value !== '' && regexpSDT.test(value) === false) {
        return {validPhoneNumber: true};
      }
    }
    return null;
  }

  static validKeypairName(control: AbstractControl): ValidationErrors | null { //valid keypair
    var regex = new RegExp("^[a-zA-Z0-9_ ]*$")
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (regex.test(control.value) == false) {
        return {validKeypairName: true};
      }
    }
    return null;
  }

}
