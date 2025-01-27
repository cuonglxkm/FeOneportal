import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export class AppValidator {
  // @ts-ignore
  static checkContainSpecialCharactorExceptComma(obj) {
    var regex = /[!`@#$%^&*~()_+=\[\]{};,':"\\|.<>?]+/; // Trừ ký tự /-
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

  static validPhoneNumber(control: AbstractControl): ValidationErrors | null { //valid số điện thoại ^(\+?84[3|5|7|8|9]|84[3|5|7|8|9]|0[3|5|7|8|9])+(\d{8})$
    var regexpSDT = new RegExp('^(84[3|5|7|8|9]|0[3|5|7|8|9])+(\\d{8})$');
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (control.value != '' && regexpSDT.test(control.value) == false) {
        return { validPhoneNumber: true };
      }
    }
    return null;
  }

  // @ts-ignore
  static validEmail(control: AbstractControl): ValidationErrors | null { //valid email
    var regex = new RegExp('^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$');
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

export const duplicateDomainValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const domain = control.value;
  const parent = control.parent as FormGroup;

  if (!domain || !parent) {
    return null;
  }

  const siblings = (parent.parent as FormArray).controls;
  const duplicate = siblings.some((sibling) => sibling !== parent && sibling.get('domain')?.value === domain);

  return duplicate ? { duplicateDomain: true } : null;
};

export function ipValidatorMany(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const ipPattern = /^(?:[1-9]\d{0,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])$/;

  if (/;\s/.test(control.value)) {
    return { invalidIP: true };
  }

  const ips = control.value.trim().split(';').map(ip => ip.trim());

  if (ips.length > 64) {
    return { maxIPs: true };
  }

  const uniqueIps = new Set<string>();
  
  for (const ip of ips) {
    if (!ipPattern.test(ip)) {
      return { invalidIP: true };
    }
    if (uniqueIps.has(ip)) {
      return { duplicateIP: true };
    }
    uniqueIps.add(ip);
  }

  return null;
}

export const fileValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const files = control.value as File[]; // Type assertion to File[]

  if (!files || !Array.isArray(files)) {
    return { invalidFiles: true };
  }

  const maxFiles = 10;
  const maxSize = 44 * 1024; // 44 KB in bytes
  const allowedFormats = ['pem', 'key', 'crt', 'cer', 'der', 'pfx', 'jks'];

  let error: ValidationErrors | null = null;

  if (files.length > maxFiles) {
    error = { maxFilesExceeded: true };
  }

  files.forEach(file => {
    if (file.size > maxSize) {
      error = { maxSizeExceeded: true };
    }
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedFormats.includes(fileExtension)) {
      error = { invalidFormat: true };
    }
  });

  return error;
};

export function cidrValidator(control: AbstractControl): ValidationErrors | null {
  const cidrPattern = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.0\/(24)$|^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.0\.0\/(16)$/;
  const value = control.value?.trim();

  if (!value) {
    return null;
  }

  if (value.includes(';') || value.includes('-') || value.includes('+') || value.includes('=') || value.includes('_') ||value.includes(':') || value.includes('"') || value.includes("'") || value.includes('?') || value.includes('>') ||value.includes('<') || value.includes('`') ||value.includes('~') || value.includes('!') || value.includes('@') ||value.includes('#') ||value.includes('$') || value.includes('%') ||value.includes('^') ||value.includes('&')) {
    return { spaceAfterComma: true };
  }

  const cidrBlocks = value.split(',').map(cidr => cidr.trim());

  if (cidrBlocks.length > 20) {
    return { maxCIDRs: true };
  }

  if (value.includes(', ') || value.includes(' ')) {
    return { wrongFormat: true };
  }

  const uniqueCidrs = new Set<string>();

  // Validate each CIDR block
  for (let cidr of cidrBlocks) {
    if (!cidrPattern.test(cidr)) {
      return { invalidCidrFormat: true };
    }
    if (uniqueCidrs.has(cidr)) {
      return { duplicateCIDR: true };
    }
    uniqueCidrs.add(cidr);
  }

  return null;
}




export function ipAddressValidatorRouter(subnetIPWithMask: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const ipAddress = control.value;
    if (!ipAddress) {
      return null;
    }
    const [subnetIP, maskString] = subnetIPWithMask.split('/');
    const mask = parseInt(maskString, 10);

    const ipOctets = ipAddress.split('.');
    const subnetOctets = subnetIP.split('.');

    if (mask === 16) {
      if (ipOctets[0] !== subnetOctets[0] || ipOctets[1] !== subnetOctets[1]) {
        return { 'invalidSubnetIP': true };
      }
    } else if (mask === 24) {
      if (
        ipOctets[0] !== subnetOctets[0] ||
        ipOctets[1] !== subnetOctets[1] ||
        ipOctets[2] !== subnetOctets[2]
      ) {
        return { 'invalidSubnetIP': true };
      }
    } else {
      return { 'unsupportedMask': true };
    }

    const lastNumber = parseInt(ipOctets[3], 10);
    if (isNaN(lastNumber) || lastNumber < 0 || lastNumber > 255) {
      return { 'invalidLastNumber': true };
    }

    return null;
  };
}






// Validator function để kiểm tra nếu storage nhỏ hơn sizeInGB
export function storageValidator(sizeInGB: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    // Kiểm tra nếu storage nhỏ hơn sizeInGB
    return value < sizeInGB ? { 'outOfStorageSnapshot': true } : null;
  };
}

// Validator function check url chỉ chứa duy nhất 1 dấu '/' ở đầu
export function startsWithSingleSlashValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value) {
      const isValid = control.value.startsWith('/') && !control.value.slice(1).startsWith('/');
      return isValid ? null : { startsWithSingleSlash: { value: control.value } };
    }
    return null;
  };
}

export function ipValidatorVlan(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const ip = control.value;
    if (!ip) return null; // Không kiểm tra nếu ô input trống

    // Kiểm tra định dạng
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\/(16|24)$/;
    if (!ipPattern.test(ip)) return { invalidIp: true };

    // Tách các phần của địa chỉ IP và CIDR
    const [address, cidr] = ip.split('/');
    const [a, b, c, d] = address.split('.').map(Number);

    // Kiểm tra các giá trị IP nằm trong khoảng hợp lệ
    // if (a < 0 || a > 255 || b < 0 || b > 255 || c < 0 || c > 255 || d < 0 || d > 255) {
    //   return { invalidIp: true };
    // }

    if (cidr === '16') {
      if (
        (a === 10 && b >= 10 && b <= 100) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) 
      ) {
        if (c != 0 || d != 0) {
          return { invalidIp: true };
        }
        return null;
      }
    } else if (cidr === '24') {
      if (
        (a === 10 && b >= 10 && b <= 100) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) 
      ) {
        if ( d != 0) {
          return { invalidIp: true };
        }
        return null;
      }
    }

    return { invalidIp: true };
  };
}

export function hostValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const ipPattern = /^(?:[1-9]\d{0,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])$/;

  const domainPattern = /^(?![-.])[a-zA-Z0-9-]{1,63}(?:\.[a-zA-Z0-9-]{1,63})*(?<![-.])\.[a-zA-Z]{2,63}$/;

  const value = control.value.trim();

  const isValidDomain = domainPattern.test(value);
  const isValidIp = ipPattern.test(value);

  if (isValidDomain && isValidIp) {
    return { invalidHost: true }
  }

  if (!isValidDomain && !isValidIp) {
    return { invalidHost: true };
  }

  return null; 
}

export function peerIdValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const ipPattern = /^(?:[1-9]\d{0,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.(?:\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])$/;

  const domainPattern = /^(?![-.])[a-zA-Z0-9-]{1,63}(?:\.[a-zA-Z0-9-]{1,63})*(?<![-.])\.[a-zA-Z]{2,63}$/;
  const emailPattern = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;

  const value = control.value.trim();

  const isValidDomain = domainPattern.test(value);
  const isValidIp = ipPattern.test(value);
  const isValidEmail = emailPattern.test(value);

  if (isValidDomain && isValidIp && isValidEmail) {
    return { invalidHost: true }
  }

  if (!isValidDomain && !isValidIp && !isValidEmail) {
    return { invalidHost: true };
  }


  return null; 
}


export function ipWafDomainValidatorMany(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const ipPattern = /\b((1\d{0,2}|2[0-4]\d|25[0-5])\.)((1?\d{1,2}|2[0-4]\d|25[0-5])\.){2}(1?\d{1,2}|2[0-4]\d|25[0-5])\b/
  const ips = control.value.split(';');

  for (const ip of ips) {
    if (!ipPattern.test(ip.trim())) {
      return { invalidIP: true };
    }
  }

  return null;
}


