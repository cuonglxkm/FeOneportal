import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertUnit'
})
export class ConvertUnitPipe implements PipeTransform {

  transform(value: number, toUnit: string): number {
    switch(toUnit) {
      case 'MB':
        return value;
      case 'GB':
        return (value / 1024);
      case 'KB':
        return (value * 1024);

      default:
        return value;
    }

  }

}
