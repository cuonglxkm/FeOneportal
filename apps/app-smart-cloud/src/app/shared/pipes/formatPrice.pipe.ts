import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatPrice',

})
export class formatPrice implements PipeTransform {
    transform(numberPrice: number): string {
        return  numberPrice.toLocaleString();
    }
}
