import {Component, Input, OnInit} from '@angular/core';
import SecurityGroupRule from "../../../../core/model/interface/security-group-rule";
import {SecurityGroupSearchCondition} from "../../../../core/model/interface/security-group";

@Component({
  selector: 'one-portal-list-outbound',
  templateUrl: './list-outbound.component.html',
  styleUrls: ['./list-outbound.component.less'],
})
export class ListOutboundComponent implements OnInit{
  @Input() listOutbound: SecurityGroupRule[] = [];
  @Input() conditionSearch: SecurityGroupSearchCondition

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
