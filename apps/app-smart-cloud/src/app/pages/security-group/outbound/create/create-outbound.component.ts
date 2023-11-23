import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {SecurityGroupSearchCondition} from "../../../../shared/models/security-group";

@Component({
  selector: 'one-portal-outbound',
  templateUrl: './create-outbound.component.html',
  styleUrls: ['./create-outbound.component.less'],
})
export class CreateOutboundComponent implements OnInit {
  @Input() disabled?: boolean
  @Input() condition: SecurityGroupSearchCondition
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false;

  showModal(): void {
    this.isVisible = true;
  }


  handleOk() {
    this.isVisible = false;
    this.onOk.emit();
  }

  handleCancel(): void {
    this.isVisible = false;
    this.onCancel.emit();
  }
  ngOnInit(): void {

  }
}
