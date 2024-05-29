import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateLabel'
})
export class TruncateLabel implements PipeTransform {

  transform(value: string, len?: number): string {
    if (value && len) {
      return (value + '').substring(0, len) + '...';
    }
    if (value) {
      return (value + '').substring(0, 30) + '...';
    }
  }

}
