import {Component, Input, OnInit} from '@angular/core';
import SecurityGroupRule from "../../../../shared/models/security-group-rule";
import {SecurityGroupSearchCondition} from "../../../../shared/models/security-group";

@Component({
  selector: 'one-portal-list-outbound',
  templateUrl: './list-outbound.component.html',
  styleUrls: ['./list-outbound.component.less'],
})
export class ListOutboundComponent implements OnInit{
  @Input() listOutbound: SecurityGroupRule[] = [];
  @Input() conditionSearch: SecurityGroupSearchCondition
  @Input() securityGroupId?: string;
  @Input() isLoading: boolean
  @Input() region: number
  @Input() project: number

  isVisible = false;
  title: string = 'Xác nhận xóa Outbound';
  content: string = 'Bạn có chắc chăn muốn xóa Outbound';
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(id: string): void {
    this.isVisible = false;
    this.listOutbound = this.listOutbound.filter(value => value.id !== id)
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  ngOnInit(): void {
  }
}
