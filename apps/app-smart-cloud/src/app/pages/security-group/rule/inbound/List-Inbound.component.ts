import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import Pagination from '../../../../shared/models/pagination';
import SecurityGroupRule, { RuleSearchCondition } from '../../../../shared/models/security-group-rule';
import { SecurityGroupRuleService } from '../../../../shared/services/security-group-rule.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SecurityGroup, SecurityGroupSearchCondition } from '../../../../shared/models/security-group';
import { SecurityGroupService } from '../../../../shared/services/security-group.service';

@Component({
  selector: 'one-portal-list-inbound',
  templateUrl: './List-Inbound.component.html',
  styleUrls: ['./List-Inbound.component.less'],
})
export class ListInboundComponent implements OnInit, OnChanges {
  @Input() securityGroupId?: string;
  @Input() securityGroupName?: string;
  @Input() regionId: number
  @Input() projectId: number




  collection: Pagination<SecurityGroupRule>;
  condition = new RuleSearchCondition()

  isVisible = false;
  isLoading = false;

  pageSize: number = 5
  pageNumber: number = 1

  constructor(
    private ruleService: SecurityGroupRuleService,
    private securityGroupService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService) {}

  onPageSizeChange(event: any) {
    this.pageSize = event
    this.getRule();
  }

  onPageIndexChange(event: any) {
    this.pageNumber = event;
    this.getRule();
  }

  getRule() {
    this.condition.direction = 'ingress'
    this.condition.userId = this.tokenService.get()?.userId
    this.condition.projectId = this.projectId
    this.condition.regionId = this.regionId
    this.condition.pageSize = this.pageSize
    this.condition.pageNumber = this.pageNumber
    this.condition.securityGroupId = this.securityGroupId
    this.isLoading = true

    if (!this.condition.securityGroupId) {
      this.collection = {
        previousPage: 0,
        records: [],
        currentPage: 1,
        totalCount: 0,
        pageSize: 5
      }
      this.isLoading = false
      return;
    }

    this.ruleService.search(this.condition)
      .subscribe((data) => {
        this.collection = data;
        this.isLoading = false
        console.log('rule inbound', this.collection)
      }, error => {
        this.isLoading = false
        this.collection = null
        // this.notification.error('Thất bại', `Lấy dữ liệu thất bại`);
      })

  }

  getSecurityGroupNameByRemoteGroupId(remoteGroupId: string): string | null {
      const sg = this.listSecurityGroup.find(group => group.id === remoteGroupId);
      return sg ? sg.securityGroupName : '';
  }

  listSecurityGroup: any;
  getSecurityGroup()  {
    let searchForm = new SecurityGroupSearchCondition();
    searchForm.userId = this.tokenService.get()?.userId
    searchForm.regionId = this.regionId
    searchForm.projectId = this.projectId

    this.securityGroupService.search(searchForm).subscribe(data => {
      this.listSecurityGroup = data;
    })
  }

  handleOkDeleteInbound() {
    this.getRule()
  }

  handleOkCreateInbound() {
    this.getRule()
  }

  ngOnInit(): void {
    this.getRule();
    this.getSecurityGroup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getRule()
  }
}
