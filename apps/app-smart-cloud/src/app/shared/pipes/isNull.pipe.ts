import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isNull'
})
export class isNullPipe implements PipeTransform {

  transform(value: any): string {
    return value === null || value === undefined ? '-' : value;
  }

}