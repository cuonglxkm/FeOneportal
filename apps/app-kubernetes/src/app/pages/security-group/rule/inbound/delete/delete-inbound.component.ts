import { SecurityGroupService } from './../../../../../services/security-group.service';
import { FormDeleteRule } from './../../../../../model/security-group.model';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-delete-inbound',
  templateUrl: './delete-inbound.component.html',
  styleUrls: ['./delete-inbound.component.less'],
})
export class DeleteInboundComponent {

  @Input() idInbound: string;
  @Input() nameRule: string;
  @Input() region: number;
  @Input() project: number;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onOk = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  constructor(
    private sgService: SecurityGroupService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }
  showModal() {
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    let formDeleteRule = new FormDeleteRule();
    formDeleteRule.id = this.idInbound;
    formDeleteRule.userId = this.tokenService.get()?.userId;
    formDeleteRule.regionId = this.region;
    formDeleteRule.projectId = this.project;
    this.sgService.deleteRule(formDeleteRule)
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.success('Thành công', 'Xóa Inbound ' + this.nameRule + ' thành công');
        this.onOk.emit(this.idInbound);
      },
      error: () => {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.error('Thất bại', 'Xóa Inbound ' + this.nameRule + ' thất bại');
      }
    });
  }
}
