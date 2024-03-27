import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateLabel'
})
export class TruncateLabel implements PipeTransform {

  transform(value: string): string {
    if (value) {
      return (value + '').substring(0, 30) + '...';
    }
  }

}
