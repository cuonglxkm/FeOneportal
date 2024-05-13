import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { KubernetesCluster, ProgressData } from '../model/cluster.model';
import { SGLoggingReqDto, SecurityGroupData } from '../model/security-group.model';

@Injectable({
  providedIn: 'root',
})
export class ShareService {

  private progressData = new Subject<ProgressData>();
  public $progressData = this.progressData.asObservable();

  private securityGroupData = new Subject<SecurityGroupData>();
  public $securityGroupData = this.securityGroupData.asObservable();

  private sgLogReq = new Subject<SGLoggingReqDto>();
  public $sgLogReq = this.sgLogReq.asObservable();

  emitData(data: ProgressData) {
    this.progressData.next(data);
  }

  emitSGData(data: SecurityGroupData) {
    this.securityGroupData.next(data);
  }

  emitSGLog(data: SGLoggingReqDto) {
    this.sgLogReq.next(data);
  }

}
