import {Component, Inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import SecurityGroupRule, {RuleSearchCondition} from "../../../../shared/models/security-group-rule";
import {SecurityGroupRuleService} from "../../../../shared/services/security-group-rule.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import Pagination from "../../../../shared/models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzTableQueryParams} from "ng-zorro-antd/table";

@Component({
    selector: 'one-portal-inbound-list',
    templateUrl: './inbound-list.component.html',
    styleUrls: ['./inbound-list.component.less'],
})
export class InboundListComponent implements OnInit, OnChanges {
    @Input() securityGroupId?: string;
    @Input() regionId: number
    @Input() projectId: number

    title: string = 'Xác nhận xóa Inbound';
    content: string = 'Quý khách chắc chắn muốn xóa dịch vụ này?';

    collection: Pagination<SecurityGroupRule>;
    condition = new RuleSearchCondition()
    isVisible = false;
    isLoading = false;
    pageSize: number = 5
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
                pageSize: 10
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

    ngOnChanges(changes: SimpleChanges): void {
        this.getRule();
    }
}
