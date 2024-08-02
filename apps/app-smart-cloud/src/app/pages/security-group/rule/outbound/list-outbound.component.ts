import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SecurityGroupRuleService } from '../../../../shared/services/security-group-rule.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Pagination from '../../../../shared/models/pagination';
import SecurityGroupRule, { RuleSearchCondition } from '../../../../shared/models/security-group-rule';
import { SecurityGroup, SecurityGroupSearchCondition } from '../../../../shared/models/security-group';
import { SecurityGroupService } from '../../../../shared/services/security-group.service';

@Component({
  selector: 'one-portal-list-outbound',
  templateUrl: './list-outbound.component.html',
  styleUrls: ['./list-outbound.component.less'],
})
export class ListOutboundComponent implements OnInit, OnChanges{
  @Input() securityGroupId?: string;
  @Input() securityGroupName?: string;
  @Input() regionId: number
  @Input() projectId: number
  @Input() listSG: SecurityGroup[];

  collection: Pagination<SecurityGroupRule>;
  condition = new RuleSearchCondition()

  isVisible = false;
  isLoading = false;

  pageSize: number = 5
  pageNumber: number = 1
  constructor(
    private ruleService: SecurityGroupRuleService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private securityGroupService: SecurityGroupService,
    private notification: NzNotificationService) {}
  getRule() {
    this.condition.direction = 'egress'
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
        const idToNameMap = new Map(this.listSG.map(item => [item.id, item.name]));
        data.records = data.records.map(record => {
          const remoteGroupName = idToNameMap.get(record.remoteGroupId) || null; // Get name from map, default to null if not found
          return { ...record, remoteGroupName };
        });
        this.collection = data;
        this.isLoading = false
        console.log('rule outbound', this.collection)
      }, error => {
        this.isLoading = false
        this.collection = null
      })

  }



  onPageSizeChange(event: any) {
    this.pageSize = event
    this.getRule();
  }

  onPageIndexChange(event: any) {
    this.pageNumber = event;
    this.getRule();
  }

  handleOkDeleteOutbound() {
    this.getRule()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getRule();
  }

  ngOnInit(): void {
    this.getRule();
  }
}
