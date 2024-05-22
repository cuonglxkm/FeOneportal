import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressCluster'
})
export class ProgressPipe implements PipeTransform {

  transform(clusterName: string, namespace: string, mapProgress: Map<string, number>): number {
    let keyObj = namespace + ';' + clusterName;
    return mapProgress?.get(keyObj);
  }

}
