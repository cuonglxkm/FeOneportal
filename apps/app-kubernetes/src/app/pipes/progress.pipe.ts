import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressCluster'
})
export class ProgressPipe implements PipeTransform {

  transform(clusterName: string, namespace: string, progressOfClusters: {key_name: string, current_value: number}[]): number {
    let keyObj = namespace + ';' + clusterName;
    return progressOfClusters.find(item => item.key_name == keyObj)?.current_value;
  }

}
