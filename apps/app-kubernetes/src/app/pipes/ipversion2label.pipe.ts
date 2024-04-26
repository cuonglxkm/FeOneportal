import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'protocol2label'
})
export class Protocol2LabelPipe implements PipeTransform {

  transform(protocol: string): string {
    switch(protocol) {
      case 'tcp':
        return 'TCP';
      case 'udp':
        return 'UDP';
      case 'any':
        return 'Any';

      default:
        return 'Unknown';
    }
  }

}
