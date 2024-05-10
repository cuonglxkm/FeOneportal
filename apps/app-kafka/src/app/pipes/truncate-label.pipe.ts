import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateLabel',
})
export class TruncateLabelPipe implements PipeTransform {
  transform(label: string): string {
    return label.length > 27 ? label.slice(0, 27) + '...' : label;
  }
}
