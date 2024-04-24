import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { KubernetesCluster, ProgressData } from '../model/cluster.model';
import { SecurityGroupData } from '../model/security-group.model';

@Injectable({
  providedIn: 'root',
})
export class ShareService {

  private progressData = new Subject<ProgressData>();
  public $progressData = this.progressData.asObservable();

  private securityGroupData = new Subject<SecurityGroupData>();
  public $securityGroupData = this.securityGroupData.asObservable();

  emitData(data: ProgressData) {
    this.progressData.next(data);
  }

  emitSGData(data: SecurityGroupData) {
    this.securityGroupData.next(data);
  }

}
