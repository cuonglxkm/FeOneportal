import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressCluster'
})
export class ProgressPipe implements PipeTransform {

  transform(clusterName: string, namespace: string, mapProgress: Map<{serviceName: string, namespace: string}, number>): number {
    let keyObj = {serviceName: clusterName, namespace: namespace};
    return mapProgress.get(keyObj);
  }

}
