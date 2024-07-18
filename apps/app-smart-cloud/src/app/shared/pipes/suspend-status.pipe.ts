import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'suspendStatus'
})
export class SuspendStatusPipe implements PipeTransform {

  transform(protocol: string): string {
    switch(protocol) {
      case 'CHAMGIAHAN':
        return 'Chậm gia hạn';
      default:
        return 'Chưa rõ lí do';
    }
  }

}
