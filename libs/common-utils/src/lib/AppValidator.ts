import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export class AppValidator {
  // @ts-ignore
  static checkContainSpecialCharactorExceptComma(obj) {
    var regex = /[!`@#$%^&*~()_+=\[\]{};':"\\|.<>?]+/; // Trừ ký tự ,/-
    return regex.test(obj);
  }

  // @ts-ignore
  static checkContainSpecialCharactor(obj) {
    var regex = /[!`@#$%^&*~()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return regex.test(obj);
  }

  // @ts-ignore
  static checkContainSpecial2(obj) {
    var regex = /[!`@#$%^&*~()+\-=\[\]{};':"\\|,.<>\/?]+/;
    return regex.test(obj);
  }

  // @ts-ignore
  static checkNoWhitespace(obj) {
    return obj.trim().length === 0;
  }

  static cannotContainSpecialCharactor(control: AbstractControl): ValidationErrors | null { //ký tự đặc biệt
    if (AppValidator.checkContainSpecialCharactor(control.value) == true) {
      return { containSpecialExceptComma: true };
    }
    return null;
  }

  static cannotContainSpecial(control: AbstractControl): ValidationErrors | null { //ký tự đặc biệt
    if (AppValidator.checkContainSpecial2(control.value) == true) {
      return { containSpecial: true };
    }
    return null;
  }

  static cannotContainSpecialCharactorExceptComma(control: AbstractControl): ValidationErrors | null { //ký tự đặc biệt
    if (AppValidator.checkContainSpecialCharactorExceptComma(control.value) == true) {
      return { containSpecial: true };
    }
    return null;
  }

  static cannotContainNumber(control: AbstractControl): ValidationErrors | null {
    var regex = /^[0-9]/;
    if (regex.test(control.value) == false) {
      return { containNumber: true };
    }
    return null;
  }

  static validPhoneNumber(control: AbstractControl): ValidationErrors | null { //valid số điện thoại
    var regexpSDT = new RegExp('^(01|03|05|07|08|09)+(\\d{8})$');
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (control.value != '' && regexpSDT.test(control.value) == false) {
        return { validPhoneNumber: true };
      }
    }
    return null;
  }

  // @ts-ignore
  static validEmail(control: AbstractControl): ValidationErrors | null { //valid email
    var regex = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$');
    // var regex = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (regex.test(control.value) == false) {
        return { validEmail: true };
      }
    }
  }

  static noWhitespaceValidator(control: AbstractControl): ValidationErrors | null { //valid không cho nhập khoảng trắng
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      const isWhitespace = AppValidator.checkNoWhitespace(control && control.value && control.value.toString() || '');
      const isValid = !isWhitespace;
      return isValid ? null : { 'noWhitespaceValidator': true };
    } else return null;
  }

  static spaceValidator(control: AbstractControl): ValidationErrors | null { //valid không cho nhập khoảng trắng
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (control.value.toString().includes(' ')) {
        return { spaceValidator: true };
      }
    }
    return null;
  }

  static passwordMatchValidator(control: AbstractControl): ValidationErrors | null { //valid nhập lại mật khẩu
    const password = control.get('password')?.value;
    const confirmPass = control.get('confirmPass')?.value;
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      return password === confirmPass ? null : { passwordMatchValidator: true };
    } else return null;
  }

  static currencyValidator(control: AbstractControl): ValidationErrors | null { // valid tiền tối đa 10 chữ số, 2 chữ thap phan
    const regexpCurrency = new RegExp('^\\d{1,10}(?:\\.\\d{0,2})?$');
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      // tslint:disable-next-line:triple-equals
      console.log('currencyValidator', control.value);
      const value = control.value.replace(/,/g, '');
      if (value !== '' && regexpCurrency.test(value) === false) {
        return { validCurrency: true };
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
        return { validMST: true };
      }
    }
    return null;
  }

  static validPassword(control: AbstractControl): ValidationErrors | null { //
    const regexpCurrency = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*~()_+\-=\[\]{};\\:'"\\|,.<>\/?]).{8,}$/;
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      // tslint:disable-next-line:triple-equals
      const value = control.value.replace(/,/g, '');
      if (value !== '' && regexpCurrency.test(value) === false) {
        return { validPassword: true };
      }
    }
    return null;
  }

  static validPhoneNumber2(control: AbstractControl): ValidationErrors | null { //valid số điện thoại
    var regexpSDT = /^(\+|0)[0-9]{9,14}$/;
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      const value = control.value.replace(/,/g, '');
      if (value !== '' && regexpSDT.test(value) === false) {
        return { validPhoneNumber: true };
      }
    }
    return null;
  }

  static startsWithValidator(startValue: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const inputValue = control.value as string;
      if (inputValue && !inputValue.startsWith(startValue)) {
        return { 'startsWith': true };
      }
      return null;
    };
  }

  static validKeypairName(control: AbstractControl): ValidationErrors | null { //valid keypair
    var regex = new RegExp('^[a-zA-Z0-9_]*$');
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (regex.test(control.value) == false) {
        return { validKeypairName: true };
      }
    }
    return null;
  }

  static ipWithCIDRValidator(control: { value: string }): { [key: string]: boolean } | null { //validate input ip
    const ipAddress = control.value;
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[12]?[0-9])$/;

    // Kiểm tra xem địa chỉ IP có đúng định dạng không
    if (!ipRegex.test(ipAddress)) {
      return { invalidIp: true }; // Trả về một object có thuộc tính invalidIp để chỉ ra lỗi
    }

    // Tách địa chỉ IP và subnet mask
    const [ip, subnetMask] = ipAddress.split('/');

    // Kiểm tra xem subnet mask có vượt quá 32 không
    if (parseInt(subnetMask, 10) > 32) {
      return { invalidSubnetMask: true }; // Trả về một object có thuộc tính invalidSubnetMask để chỉ ra lỗi
    }
    console.log('ip', ipAddress)
    console.log('regex', ipRegex)

    return null; // Trả về nếu địa chỉ IP hợp lệ và subnet mask không vượt quá 32
  }

  static ipWithCIDRValidator1(control: { value: string }): { [key: string]: boolean } | null { //validate input ip
    const ipAddress = control.value;
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[1-9][0-9]?)\.){1}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[12]?[0-9])$/;

    // Kiểm tra xem địa chỉ IP có đúng định dạng không
    if (!ipRegex.test(ipAddress)) {
      return { invalidIp: true }; // Trả về một object có thuộc tính invalidIp để chỉ ra lỗi
    }

    // Tách địa chỉ IP và subnet mask
    const [ip, subnetMask] = ipAddress.split('/');

    // Kiểm tra xem subnet mask có vượt quá 32 không
    if (parseInt(subnetMask, 10) > 32) {
      return { invalidSubnetMask: true }; // Trả về một object có thuộc tính invalidSubnetMask để chỉ ra lỗi
    }
    console.log('ip', ipAddress)
    console.log('regex', ipRegex)

    return null; // Trả về nếu địa chỉ IP hợp lệ và subnet mask không vượt quá 32
  }

  static validCodeAndType(control: { value: string }): { [key: string]: boolean } | null {
    const value = parseFloat(control.value);
    if (value < -1 || value > 255) {
      return { outOfRange: true };
    }
    return null;
  }

  static validateNumber(control: { value: string }): { [key: string]: boolean } | null {
    const isIntegerInRange = /^(-1|[0-9]|[1-9][0-9]?|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(control.value);
    // const isNumber = !isNaN(parseFloat(control.value)) && isFinite(Number(control.value));
    if (!isIntegerInRange && !!control.value) {
      return { invalidNumber: true };
    }
    return null;
  }

  static validateProtocol(control: { value: string }): { [key: string]: boolean } | null {

    const value = parseInt(control.value, 10);

    // Check if the value is an integer and within the range -1 to 255
    if (isNaN(value) || value < -1 || value > 255) {
      return { invalidIntegerInRange: true }; // Return validation error if not within the range
    }

    return null; // Return null if validation succeeds
  }

  static validProtocol(): ValidatorFn { // validate input protocol
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value == null) {
        return { invalidNumber: true };
      }
      const validNumberRegex = /^-?\d+(\.\d+)?$/;
      if (!validNumberRegex.test(value)) {
        return { invalidNumber: true };
      }
      const numericValue = parseFloat(value);
      if (numericValue < 1 || numericValue > 255) {
        return { outOfRange: true };
      }
      return null;
    };
  }

  static validPort(): ValidatorFn { // validate input port
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value == null) {
        return { invalidNumber: true };
      }
      const validNumberRegex = /^[1-9]\d*$/;
      if (!validNumberRegex.test(value)) {
        return { invalidNumber: true };
      }

      return null;
    };
  }

  static portValidator(fromPortControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fromPortControl = control.parent?.get(fromPortControlName);

      if (!fromPortControl) {
        return null; // If "from" port control is not found, return null
      }

      const fromPort = parseInt(fromPortControl.value, 10);
      const toPort = parseInt(control.value, 10);

      if (isNaN(fromPort) || isNaN(toPort)) {
        return null; // If either "from" or "to" port is not a number, return null
      }

      if (toPort >= fromPort) {
        return null; // If "to" port is greater than or equal to "from" port, return null (valid)
      } else {
        return { portMismatch: true }; // Otherwise, return validation error
      }
    };
  }

  static integerInRange(min: number = -1, max: number = 255): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (Validators.required(control) !== null) {
        return null; // Nếu giá trị không bắt buộc, không thực hiện kiểm tra
      }

      const value = parseInt(control.value, 10);
      if (isNaN(value) || value < min || value > max) {
        return { integerInRange: { valid: false } };
      }

      return null;
    };
  }


  // static validRangeValidator(): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: any } | null => {
  //     const fromValue = control.get('from').value;
  //     const toValue = control.get('to').value;
  //
  //     // Kiểm tra nếu giá trị 'from' và 'to' rỗng (null hoặc undefined)
  //     if (fromValue == null || toValue == null) {
  //       return { invalidNumber: true };
  //     }
  //
  //     // Sử dụng biểu thức chính quy để kiểm tra giá trị có hợp lệ
  //     const validNumberRegex = /^[1-9]\d*$/;
  //     if (!validNumberRegex.test(fromValue) || !validNumberRegex.test(toValue)) {
  //       return { invalidNumber: true };
  //     }
  //
  //     // Chuyển đổi giá trị thành số nguyên
  //     const fromNumericValue = parseInt(fromValue, 10);
  //     const toNumericValue = parseInt(toValue, 10);
  //
  //     if (fromNumericValue < 1 || toNumericValue < 1 || toNumericValue <= fromNumericValue) {
  //       return { notValidRange: true };
  //     }
  //
  //     return null;
  //   };
  // }

  static validPolicyName(control: AbstractControl): ValidationErrors | null {
    var regex = new RegExp('^[a-zA-Z0-9+=.@_-]{1,128}$');
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (regex.test(control.value) == false) {
        return { name: true };
      }
    }
    return null;
  }

  static validPolicyDescription(control: AbstractControl): ValidationErrors | null {
    var regex = new RegExp('^[A-Za-z0-9+\\-=.@_]+$');
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (regex.test(control.value) == false) {
        return { description: true };
      }
    }
    return null;
  }

  static portNameValidator(): ValidationErrors | null {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const portName = control.value;
      if (!portName) {
        return null; // Cho phép trường rỗng
      }

      // Kiểm tra ký tự đặc biệt, dấu cách và dấu tiếng Việt
      const specialCharacters = /[!@#$%^&*(),.?":{}|<>_+=/\\[\];`~\s]/;
      if (specialCharacters.test(portName)) {
        return { 'invalidCharacters': true };
      }

      return null; // Tên cổng hợp lệ
    };
  }
}

export function ipAddressValidator(subnet: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const ipAddress: string = control.value;
    if (!ipAddress) {
      return null; // Cho phép trường rỗng
    }

    // Kiểm tra định dạng IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      return { 'invalidIp': true };
    }

    // Tách dải và bit cuối
    const [subnetPart, lastPart] = ipAddress.split('.').slice(0, 4);

    // Kiểm tra dải /16
    if (subnet === '/16') {
      const subnetPrefix = subnetPart.substring(0, subnetPart.lastIndexOf('.'));
      if (subnetPrefix !== '10.21') {
        return { 'invalidSubnet': true };
      }
    }

    // Kiểm tra dải /24
    if (subnet === '/24') {
      if (subnetPart !== '10.21.0') {
        return { 'invalidSubnet': true };
      }
    }

    // Kiểm tra bit cuối
    const lastBit = parseInt(lastPart, 10);
    if (lastBit < 1 || lastBit > 254) {
      return { 'invalidLastBit': true };
    }

    return null; // IP hợp lệ
  };
}

export function ipAddressExistsValidator(ipAddresses: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const ipAddress = control.value;
    if (ipAddresses.includes(ipAddress)) {
      return { 'ipAddressExists': { value: ipAddress } };
    }
    return null;
  };

}


export function ipAddressValidatorRouter(subnetIP: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const ipAddress = control.value;
    if (!ipAddress) {
      return null;
    }

    const networkPart = subnetIP.split('.').slice(0, 3).join('.');
    if (!ipAddress.startsWith(networkPart)) {
      return { 'invalidSubnetIP': true };
    }

    const lastNumber = parseInt(ipAddress.split('.')[3], 10);
    if (!lastNumber || lastNumber < 0 || lastNumber > 255) {
      return { 'invalidLastNumber': true };
    }

    return null;
  };

}



