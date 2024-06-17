import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertData'
})
export class ConvertData implements PipeTransform {
  transform(size: number): string {
    console.log(size);
    if(size == 0)
      return "0 B"
    if(!size || size == null)
      return "-"
    if (size <= 1024) {
      return size + ' B';
    } else if (size <= 1048576) {
      return (size / 1024).toFixed(1) + ' KB';
    } else if (size <= 1073741824) {
      return (size / 1048576).toFixed(1) + ' MB';
    }
    return (size / 1073741824).toFixed(1) + ' GB';
  }
}
