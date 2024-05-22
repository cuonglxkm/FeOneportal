import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription, finalize } from 'rxjs';
import SecurityGroupRule, { SGLoggingReqDto, SecurityGroup, SecurityGroupData, SecurityGroupSearchCondition } from '../../model/security-group.model';
import { SecurityGroupService } from '../../services/security-group.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ShareService } from '../../services/share.service';
import { KubernetesCluster } from '../../model/cluster.model';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { ClusterService } from '../../services/cluster.service';
import { camelizeKeys } from 'humps';

@Component({
  selector: 'security-group',
  templateUrl: './security-group.component.html',
  styleUrls: ['./security-group.component.css'],
})
export class SecurityGroupComponent implements OnInit, OnChanges, OnDestroy {

  @Input('regionId') regionId: number;
  @Input('projectId') projectId: number;
  @Input('detailCluster') detailCluster: KubernetesCluster;

  isLoadingSG: boolean;
  listOfSG: SecurityGroup[];
  listOfInbound: SecurityGroupRule[];
  listOfOutbound: SecurityGroupRule[];
  selectedSG: SecurityGroup;

  subscription: Subscription;

  constructor(
    private clipboardService: ClipboardService,
    private securityGroupService: SecurityGroupService,
    private clusterService: ClusterService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notificationService: NzNotificationService,
    private shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.isLoadingSG = false;
    this.listOfSG = [];
    this.listOfInbound = [];
    this.listOfOutbound = [];

    this.subscription = this.shareService.$sgLogReq.subscribe((sgLogData: SGLoggingReqDto) => {
      if (sgLogData) {
        sgLogData.securityGroupName = this.detailCluster.securityGroupName;
        sgLogData.serviceOrderCode = this.detailCluster.serviceOrderCode;

        this.clusterService.createLogSG(sgLogData)
        .subscribe((r: any) => {
          console.log({response: r});
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']?.currentValue) {
      this.projectId = changes['projectId'].currentValue;
    }

    if (changes['regionId']?.currentValue) {
      this.regionId = changes['regionId'].currentValue;
    }

    if (changes['detailCluster']?.currentValue) {
      this.detailCluster = changes['detailCluster']?.currentValue;
    }

    if (this.projectId && this.regionId) {
      this.getListSG();
      // this.getAllRuleSG();
    }
  }

  handleCopyIDGroup() {
    this.clipboardService.copy(this.selectedSG.id);
    this.notificationService.success("Đã sao chép", null);
  }

  getListSG() {
    let conditionSearch = new SecurityGroupSearchCondition();
    conditionSearch.userId = this.tokenService.get()?.userId;
    conditionSearch.projectId = this.projectId;
    conditionSearch.regionId = this.regionId;

    this.clusterService.getAllSG(this.projectId, this.regionId)
    .pipe(finalize(() => this.isLoadingSG = false))
    .subscribe((data: any) => {
      this.listOfSG = camelizeKeys(data.data) as SecurityGroup[];

      this.listOfSG.forEach(item => {
        if(item.name.includes(this.detailCluster.securityGroupName)) {
          this.selectedSG = item;
        }
      })

      if (this.selectedSG) {
        this.listOfInbound = this.selectedSG?.securityGroupRules.filter(value => value.direction === 'ingress');
        this.listOfOutbound = this.selectedSG?.securityGroupRules.filter(value => value.direction === 'egress');

        let sgData = new SecurityGroupData();
        sgData.projectId = this.projectId;
        sgData.regionId = this.regionId;
        sgData.detailCluster = this.detailCluster;
        sgData.securityGroupId = this.selectedSG?.id;
        sgData.listOfSG = this.listOfSG;
        this.shareService.emitSGData(sgData);
      } else {
        this.notificationService.error("", "Không có thông tin security group");
      }
    });
  }

  // listOfRules: SecurityGroupRule[];
  // getAllRuleSG() {
  //   this.clusterService.getAllRuleSG(this.projectId, this.regionId)
  //   .subscribe((r: any) => {
  //     console.log(r);
  //     this.listOfRules = r.data;
  //   })
  // }

  saveLogSG(rule: SecurityGroupRule) {
    let logSG = new SGLoggingReqDto();
    logSG.securityGroupName = this.detailCluster.securityGroupName;
    logSG.serviceOrderCode = this.detailCluster.serviceOrderCode;
    logSG.action = 'delete';
    logSG.userId = this.tokenService.get()?.userId;
    rule.direction == KubernetesConstant.INBOUND_RULE ?
      logSG.operation = KubernetesConstant.DELETE_INBOUND_RULE
      : logSG.operation = KubernetesConstant.DELETE_OUTBOUND_RULE;

    let note = `Xóa rule (IP Version: ${rule.etherType}, Protocol: ${rule.protocol?.toUpperCase()}, Port Range: ${rule.portRange}, Remote IP: ${rule.remoteIp})`;
    logSG.jsonRule = note;

    this.clusterService.createLogSG(logSG)
    .subscribe((r: any) => {
      console.log({response: r});
    });
  }

}
