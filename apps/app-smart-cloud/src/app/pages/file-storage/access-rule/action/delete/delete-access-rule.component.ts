import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IpFloatingService } from '../../../../../shared/services/ip-floating.service';

@Component({
  selector: 'one-portal-delete-access-rule',
  templateUrl: './delete-access-rule.component.html',
  styleUrls: ['./delete-access-rule.component.less'],
})
export class DeleteAccessRuleComponent {
  @Input() region; number
  @Input() project: number
  @Input() idIpFloating: number
  @Input() ip: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private ipFloatingService: IpFloatingService,
              private fb: NonNullableFormBuilder) {
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
  }

  handleOk() {

  }
}
