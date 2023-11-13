import {Component, Input, OnInit} from '@angular/core';
import SecurityGroupRule from "../../../../core/model/interface/security-group-rule";
import {SecurityGroupSearchCondition} from "../../../../core/model/interface/security-group";

@Component({
  selector: 'one-portal-inbound-list',
  templateUrl: './inbound-list.component.html',
  styleUrls: ['./inbound-list.component.less'],
})
export class InboundListComponent implements OnInit{
  isVisible = false;

  @Input() listInbound: SecurityGroupRule[] = [];
  @Input() conditionSearch: SecurityGroupSearchCondition

  title: string = 'Xác nhận xóa Inbound';
  content: string = 'Bạn có chắc chăn muốn xóa Inbound';

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

  ngOnInit(): void {
  }
}
