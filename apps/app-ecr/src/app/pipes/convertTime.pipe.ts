import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertTime'
})
export class ConvertTime implements PipeTransform {
  transform(typeTime: string): string {
    switch(typeTime){
      case "SECONDS":
        return "Giây";
      case "MINUTES":
        return "Phút";
      case "HOURS":
        return "Giờ";
    }
  }
}
