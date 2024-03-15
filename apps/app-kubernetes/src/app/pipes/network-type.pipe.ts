import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'network2label'
})
export class Network2Label implements PipeTransform {

  transform(type: string): string {
    switch(type) {
      case 'calico':
        return 'Calico';
      case 'cilium':
        return 'Cilium';

      default:
        return 'Không xác định';
    }

  }

}
