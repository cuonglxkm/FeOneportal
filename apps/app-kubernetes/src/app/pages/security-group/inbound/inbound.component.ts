import { Component, Inject, OnInit } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs';
import SecurityGroupRule, { SecurityGroupData } from '../../../model/security-group.model';
import { SecurityGroupService } from '../../../services/security-group.service';
import { ShareService } from '../../../services/share.service';
import Pagination from '../../../shared/models/pagination';
import { RuleSearchCondition } from '../../../shared/models/security-group-rule';
import { KubernetesConstant } from '../../../constants/kubernetes.constant';

@Component({
  selector: 'one-portal-inbound',
  templateUrl: './inbound.component.html',
  styleUrls: ['./inbound.component.css'],
})
export class InboundComponent implements OnInit {

  listOfInbound: SecurityGroupRule[];
  pageIndex: number;
  pageSize: number;
  total: number;

  isLoadingInbound: boolean;

  collection: Pagination<SecurityGroupRule>;
  regionId: number;
  projectId: number;
  securityGroupId: string;

  readonly LOCK_RULE = KubernetesConstant.LOCK_RULE;

  constructor(
    private sgService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.listOfInbound = [];
    this.isLoadingInbound = false;
    this.total = 0;
    this.pageIndex = 1;
    this.pageSize = 5;

    this.shareService.$securityGroupData.subscribe((sgData: SecurityGroupData) => {
      this.projectId = sgData.projectId;
      this.regionId = sgData.regionId;
      this.securityGroupId = sgData.securityGroupId;

      this.getRuleInbound();
    });
  }

  onQueryParamsChange(event: any) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;

      this.getRuleInbound();
    }
  }

  condition = new RuleSearchCondition();
  getRuleInbound() {
    this.condition.direction = 'ingress';
    this.condition.userId = this.tokenService.get()?.userId;
    this.condition.projectId = this.projectId;
    this.condition.regionId = this.regionId;
    this.condition.pageSize = this.pageSize;
    this.condition.pageNumber = this.pageIndex;
    this.condition.securityGroupId = this.securityGroupId;
    this.isLoadingInbound = true;

    if (!this.condition.securityGroupId) {
      this.listOfInbound = [];
      this.isLoadingInbound = false;
      return;
    }

    this.sgService.searchRule(this.condition)
      .pipe(finalize(() => this.isLoadingInbound = false))
      .subscribe({next: (data: any) => {
        this.listOfInbound = data.records;
        this.total = data.totalCount;
      }, error: (err) => {
        this.listOfInbound = [];
        console.error('fail to get inbound rule: ', err);
      }});
  }

  handleOkDeleteInbound() {
    this.getRuleInbound();
  }
}
