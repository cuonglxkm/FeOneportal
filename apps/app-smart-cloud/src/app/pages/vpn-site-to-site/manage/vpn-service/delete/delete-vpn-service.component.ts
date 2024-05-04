import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteVpnService } from 'src/app/shared/models/vpn-service';
import { VpnServiceService } from 'src/app/shared/services/vpn-service.service';


@Component({
  selector: 'one-portal-delete-vpn-service',
  templateUrl: './delete-vpn-service.component.html',
  styleUrls: ['./delete-vpn-service.component.less'],
})
export class DeleteVpnServiceComponent{
  @Input() region; number
  @Input() project: number
  @Input() vpnServiceId: string
  @Input() vpnServiceName: string
  @Input() vpnServiceStatus: string
  @Output() onOk = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameVpnServiceValidator.bind(this)]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private vpnServiceService: VpnServiceService
              ) {
  }

  nameVpnServiceValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (name !== this.vpnServiceName) {
      return { 'nameMismatch': true };
    }
    return null;
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
  }

  handleOk() {
    this.isLoading = true
    let formDelete = new FormDeleteVpnService()
    formDelete.vpnServiceId = this.vpnServiceId
    formDelete.regionId = this.region
    formDelete.projectId = this.project
    formDelete.customerId = this.tokenService.get()?.userId
    console.log(formDelete);
    
    if(this.validateForm.valid) {
      if(this.vpnServiceName.includes(this.validateForm.controls.name.value)){
        this.vpnServiceService.deleteVpnService(this.vpnServiceId,formDelete).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success('Thành công', 'Xoá Vpn Service thành công')
            this.onOk.emit(data)
          }
        }, error => {
          if(error.status === 500){
            this.isVisible = false
          this.isLoading =  false
          this.notification.error('Thất bại', 'Vpn Service đang được sử dụng')
          }else{
            this.isVisible = false
            this.isLoading =  false
            this.notification.error('Thất bại', 'Xoá Vpn Service thất bại')
          }
          
        })
      }
    }
  }

  
}
