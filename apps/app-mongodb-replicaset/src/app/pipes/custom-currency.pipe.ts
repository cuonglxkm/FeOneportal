import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'CustomCurrency'
  })
  export class CustomCurrencyPipe implements PipeTransform{
    // transform(val: string) {
    //   return new Intl.NumberFormat('vn-IN', {
    //     style: 'currency',
    //     currency: 'VND',
        
    //   }).format(Number(val));
    // }
    transform(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  }