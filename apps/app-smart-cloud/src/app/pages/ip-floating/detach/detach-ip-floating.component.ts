import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { FormAction } from '../../../shared/models/ip-floating.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IpFloatingService } from '../../../shared/services/ip-floating.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-detach-ip-floating',
  templateUrl: './detach-ip-floating.component.html',
  styleUrls: ['./detach-ip-floating.component.less'],
})
export class DetachIpFloatingComponent implements OnInit {
  @Input() region: number
  @Input() project: number
  @Input() idIpFloating: number
  @Input() portCloudId: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  constructor(private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private ipFloatingService: IpFloatingService) {
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
    this.isLoading = true
    let formAction = new FormAction()
    formAction.id = this.idIpFloating
    formAction.portId = this.portCloudId
    formAction.action = 'detach'
    this.ipFloatingService.action(formAction).subscribe(data => {
      if(data) {
        this.isVisible = false
        this.isLoading = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('ip.floating.nofitacation.detach.success'))
        this.onOk.emit(data)
      } else {
        this.isVisible = false
        this.isLoading = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('ip.floating.nofitacation.detach.fail'))
      }
    }, error => {
      this.isVisible = false
      this.isLoading = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('ip.floating.nofitacation.detach.fail'))
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }
}
