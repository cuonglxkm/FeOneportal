import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progressCluster'
})
export class ProgressPipe implements PipeTransform {

  transform(clusterName: string, listOfProgress: Array<{cluster: string, progress: any}>): number {
    let cluster = listOfProgress.find(item => item.cluster == clusterName);
    console.log({cluster: cluster});
    if (cluster) return cluster.progress;
  }

}
