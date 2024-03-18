import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calculateDate'
})
export class CalculateDate implements PipeTransform {

  transform(createdDate: number, period: number): number {
    let d = new Date(createdDate);
    d.setMonth(d.getMonth() + period);
    return d.getTime();

  }

}
