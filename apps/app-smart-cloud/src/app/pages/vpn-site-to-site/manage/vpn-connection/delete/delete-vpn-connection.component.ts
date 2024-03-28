import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Component({
  selector: 'one-portal-delete-vpn-connection',
  templateUrl: './delete-vpn-connection.component.html',
  styleUrls: ['./delete-vpn-connection.component.less'],
})
export class DeleteVpnConnectionComponent{
  @Input() region; number
  @Input() project: number
  @Input() idIpFloating: number
  @Input() ip: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    ip: FormControl<string>
  }> = this.fb.group({
    ip: ['', [Validators.required]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder) {
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
  }

  // handleOk() {
  //   this.isLoading = true
  //   if(this.validateForm.valid) {
  //     if(this.ip.includes(this.validateForm.controls.ip.value)){
  //       this.ipFloatingService.deleteIp(this.idIpFloating).subscribe(data => {
  //         if(data) {
  //           this.isVisible = false
  //           this.isLoading =  false
  //           this.notification.success('Thành công', 'Xoá IP Floating thành công')
  //           this.onOk.emit(data)
  //         }
  //       }, error => {
  //         this.isVisible = false
  //         this.isLoading =  false
  //         this.notification.success('Thất bại', 'Xoá IP Floating thất bại')
  //       })
  //     }
  //   }
  // }

  
}
