import {Component, Inject, Input, OnInit, SimpleChanges} from '@angular/core';
import SecurityGroupRule, {RuleSearchCondition} from "../../../../shared/models/security-group-rule";
import {SecurityGroupSearchCondition} from "../../../../shared/models/security-group";
import Pagination from "../../../../shared/models/pagination";
import {SecurityGroupRuleService} from "../../../../shared/services/security-group-rule.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NzTableQueryParams} from "ng-zorro-antd/table";

@Component({
  selector: 'one-portal-list-outbound',
  templateUrl: './list-outbound.component.html',
  styleUrls: ['./list-outbound.component.less'],
})
export class ListOutboundComponent implements OnInit{
  @Input() securityGroupId?: string;
  @Input() regionId: number
  @Input() projectId: number

  title: string = 'Xác nhận xóa Outbound';
  content: string = 'Bạn có chắc chăn muốn xóa Outbound';

  collection: Pagination<SecurityGroupRule>;
  condition = new RuleSearchCondition()
  isVisible = false;
  isLoading = false;
  pageSize: number = 20
  pageNumber: number = 1

  constructor(
      private ruleService: SecurityGroupRuleService,
      @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
      private notification: NzNotificationService
  ) {
  }
  ngOnInit(): void {
    this.getRule();
  }

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
        pageSize: 20
      }
      this.isLoading = false
      return;
    }

    this.ruleService.search(this.condition)
        .subscribe((data) => {
          this.collection = data;
          this.isLoading = false
        }, error => {
          this.isLoading = false
          this.notification.error('Thất bại', `Lấy dữ liệu thất bại`);
        })

  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(id: string): void {
    this.isVisible = false;
    this.getRule();
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSize = pageSize;
    this.pageNumber = pageIndex
    this.getRule()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getRule();
  }
}
