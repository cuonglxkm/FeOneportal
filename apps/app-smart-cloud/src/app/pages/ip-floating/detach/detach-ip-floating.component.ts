import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  selector: 'one-portal-detach-ip-floating',
  templateUrl: './detach-ip-floating.component.html',
  styleUrls: ['./detach-ip-floating.component.less'],
})
export class DetachIpFloatingComponent implements OnInit {
  @Input() region; number
  @Input() project: number
  @Input() idIpFloating: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  constructor() {
  }

  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false
    this.isLoading = false
    this.onCancel.emit()
  }

  handleOk() {

  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }
}
