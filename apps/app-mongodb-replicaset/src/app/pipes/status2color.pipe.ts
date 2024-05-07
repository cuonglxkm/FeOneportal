import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status2Color'
})
export class Status2ColorPipe implements PipeTransform {
  transform(status: number): string {
    switch(status) {
      case 0:
        return "#ea3829";
      case 1:
        return "#0066b0";
      case 2:
        return "#008d47";
      case 6:
        return "#0066b0";
      case 7:
        return "#FAAD14";
      case 11:
        return "#4c4f67";
      default:
        return "#4c4f67";
    }

  }

}
