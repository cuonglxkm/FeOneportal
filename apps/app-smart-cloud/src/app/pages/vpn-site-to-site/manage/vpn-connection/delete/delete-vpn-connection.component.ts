import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteVpnConnection } from 'src/app/shared/models/vpn-connection';
import { VpnConnectionService } from 'src/app/shared/services/vpn-connection.service';


@Component({
  selector: 'one-portal-delete-vpn-connection',
  templateUrl: './delete-vpn-connection.component.html',
  styleUrls: ['./delete-vpn-connection.component.less'],
})
export class DeleteVpnConnectionComponent{
  @Input() region; number
  @Input() project: number
  @Input() vpnconnectionid: string
  @Input() status: string
  @Input() nameVpnconnection: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameVpnConnectionValidator.bind(this)]]
  });

  nameVpnConnectionValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (!name) {
      return null;
    }
    if (name !== this.nameVpnconnection) {
      return { nameMismatch: true };
    }
    return null;
  }

  constructor(private vpnConnectionService: VpnConnectionService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
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
    let formDelete = new FormDeleteVpnConnection()
    formDelete.id = this.vpnconnectionid
    formDelete.regionId = this.region
    formDelete.projectId = this.project
    console.log(formDelete);
    
    if(this.validateForm.valid) {
      if(this.nameVpnconnection.includes(this.validateForm.controls.name.value)){
        this.vpnConnectionService.deleteVpnConnection(formDelete).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success(this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.vpn-connection-delete.success'))
            this.validateForm.reset()
            this.onOk.emit(data)
          }
        }, error => {
          this.validateForm.reset()
          this.isVisible = false
          this.isLoading =  false
          this.notification.error(this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('app.vpn-connection-delete.fail'))
        })
      }
    }
  }

  
}
