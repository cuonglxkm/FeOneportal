import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emailToName'
})
export class EmailToNamePipe implements PipeTransform {
  transform(value: string): string {
    const atIndex = value.indexOf('@');
    if (atIndex !== -1) {
      return value.slice(0, atIndex);
    } else {
      return value;
    }
  }
}
