import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import SecurityGroupRule, { SecurityGroup, SecurityGroupData } from '../../../model/security-group.model';
import { ShareService } from '../../../services/share.service';
import { SecurityGroupService } from '../../../services/security-group.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RuleSearchCondition } from '../../../shared/models/security-group-rule';
import { finalize } from 'rxjs';
import { KubernetesConstant } from '../../../constants/kubernetes.constant';

@Component({
  selector: 'one-portal-outbound',
  templateUrl: './outbound.component.html',
  styleUrls: ['./outbound.component.css'],
})
export class OutboundComponent implements OnInit {

  @Output() deletedOutbound = new EventEmitter<SecurityGroupRule>();

  listOfOutbound: SecurityGroupRule[];
  pageIndex: number;
  pageSize: number;
  total: number;

  regionId: number;
  projectId: number;
  securityGroupId: string;

  listOfSG: SecurityGroup[];
  isLoadingOutbound: boolean;

  readonly LOCK_RULE = KubernetesConstant.LOCK_RULE;

  constructor(
    private sgService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.listOfSG = [];
    this.listOfOutbound = [];
    this.pageIndex = 1;
    this.pageSize = 5;
    this.total = 0;
    this.isLoadingOutbound = false;

    this.shareService.$securityGroupData.subscribe((sgData: SecurityGroupData) => {
      this.projectId = sgData.projectId;
      this.regionId = sgData.regionId;
      this.securityGroupId = sgData.securityGroupId;

      this.getRuleOutbound();
    });
  }

  onQueryParamsChange(event: any) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;

      this.getRuleOutbound();
    }
  }

  condition = new RuleSearchCondition();
  getRuleOutbound() {
    this.condition.direction = 'egress';
    this.condition.userId = this.tokenService.get()?.userId;
    this.condition.projectId = this.projectId;
    this.condition.regionId = this.regionId;
    this.condition.pageSize = this.pageSize;
    this.condition.pageNumber = this.pageIndex;
    this.condition.securityGroupId = this.securityGroupId;
    this.isLoadingOutbound = true;

    if (!this.condition.securityGroupId) {
      this.listOfOutbound = [];
      this.isLoadingOutbound = false;
      return;
    }

    this.sgService.searchRule(this.condition)
      .pipe(finalize(() => this.isLoadingOutbound = false))
      .subscribe({next: (data: any) => {
        let tmp: SecurityGroupRule[] = data.records;

        // map remoteGroupId => name
        this.listOfOutbound = tmp.map((rule: SecurityGroupRule) => {
          let sg = this.listOfSG.find(sg => sg.id == rule.remoteGroupId);
          return {
            remoteGroupName: sg?.name,
            ...rule
          }
        });

        this.total = data.totalCount;
      }, error: (err) => {
        this.listOfOutbound = [];
        console.error('fail to get outbound rule: ', err);
      }});
  }

  handleOkDeleteOutbound(idOutbound: string) {
    this.getRuleOutbound();

    const outbound = this.listOfOutbound.find(item => item.id == idOutbound);
    this.deletedOutbound.emit(outbound);
  }

}
