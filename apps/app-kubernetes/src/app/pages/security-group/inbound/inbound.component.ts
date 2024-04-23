import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SecurityGroupService } from '../../../services/security-group.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs';
import SecurityGroupRule from '../../../model/security-group.model';
import { RuleSearchCondition } from '../../../shared/models/security-group-rule';

@Component({
  selector: 'one-portal-inbound',
  templateUrl: './inbound.component.html',
  styleUrls: ['./inbound.component.css'],
})
export class InboundComponent implements OnInit, OnChanges {

  @Input('listOfInbound') listOfInbound: SecurityGroupRule[];

  pageIndex: number;
  pageSize: number;
  total: number;

  isLoadingInbound: boolean;
  isShowModalCreateInbound: boolean;
  isShowModalDeleteRule: boolean;

  constructor(
    private sgService: SecurityGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    this.isLoadingInbound = false;
    this.isShowModalCreateInbound = false;
    this.isShowModalDeleteRule = false;
    this.total = 0;
    this.pageIndex = 1;
    this.pageSize = 3;
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listOfInbound']?.currentValue) {
      this.listOfInbound = changes['listOfInbound']?.currentValue;
      this.total = this.listOfInbound.length;
    }
  }

  condition = new RuleSearchCondition();
  // getRuleInbound() {
  //   this.condition.direction = 'ingress';
  //   this.condition.userId = this.tokenService.get()?.userId;
  //   this.condition.projectId = this.projectId;
  //   this.condition.regionId = this.regionId;
  //   this.condition.pageSize = this.pageSize;
  //   this.condition.pageNumber = this.pageIndex;
  //   this.condition.securityGroupId = this.securityGroupId;
  //   this.isLoadingInbound = true;

  //   if (!this.condition.securityGroupId) {
  //     this.collection = {
  //       previousPage: 0,
  //       records: [],
  //       currentPage: 1,
  //       totalCount: 0,
  //       pageSize: 5
  //     }
  //     this.isLoadingInbound = false;
  //     return;
  //   }

  //   this.sgService.searchRule(this.condition)
  //     .pipe(finalize(() => this.isLoadingInbound = false))
  //     .subscribe((data) => {
  //       this.collection = data;
  //     });
  // }

  onQueryParamsChange(event: any) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;

      // this.getRuleInbound();
    }
  }

  showModalCreateSG() {
    this.isShowModalCreateInbound = true;
  }

  handleCancelModalCreateSG() {
    this.isShowModalCreateInbound = false;
  }

  showModalConfirmDeleteRule() {
    this.isShowModalDeleteRule = true;
  }

  handleCancelModalDeleteRule() {
    this.isShowModalDeleteRule = false;
  }
}
