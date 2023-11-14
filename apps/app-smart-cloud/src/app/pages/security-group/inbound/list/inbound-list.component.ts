import {Component, Input, OnInit} from '@angular/core';
import SecurityGroupRule from "../../../../shared/models/security-group-rule";
import {SecurityGroupSearchCondition} from "../../../../shared/models/security-group";

@Component({
  selector: 'one-portal-inbound-list',
  templateUrl: './inbound-list.component.html',
  styleUrls: ['./inbound-list.component.less'],
})
export class InboundListComponent implements OnInit {
  isVisible = false;

  @Input() listInbound: SecurityGroupRule[] = [];
  @Input() conditionSearch: SecurityGroupSearchCondition
  @Input() securityGroupId?: string;

  title: string = 'Xác nhận xóa Inbound';
  content: string = 'Bạn có chắc chăn muốn xóa Inbound';

  ngOnInit(): void {
  }
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(id: string): void {
    this.isVisible = false;
    this.listInbound = this.listInbound.filter(value => value.id !== id)
  }

  handleCancel(): void {
    this.isVisible = false;
  }


}
