import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
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
              private vpnServiceService: VpnServiceService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
              ) {
  }

  nameVpnServiceValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (!name) {
      return null;
    }
    if (name !== this.vpnServiceName) {
      return { nameMismatch: true };
    }
    return null;
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.isLoading =  false
    this.validateForm.reset()
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
        this.vpnServiceService.deleteVpnService(formDelete).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success(this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.vpn-service-delete.success'))
            this.validateForm.reset()
            this.onOk.emit(data)
          }
        }, error => {
          this.validateForm.reset()
          if(error.status === 500){
          this.isVisible = false
          this.isLoading =  false
          this.notification.error(this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.vpn-service-delete.fail2'))
          }else{
            this.isVisible = false
            this.isLoading =  false
            this.notification.error(this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.vpn-service-delete.fail'))
          }
          
        })
      }
    }
  }
  
}
