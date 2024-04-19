import { Pipe, PipeTransform } from '@angular/core';
import { KubernetesConstant } from '../constants/kubernetes.constant';

@Pipe({
  name: 'checkStatus'
})
export class CheckStatusPipe implements PipeTransform {

  transform(status: number): number {
    if (status) return KubernetesConstant.INPROGRESS_STATUS.includes(status) ? 2 : 1;
    else return 2;
  }

}
