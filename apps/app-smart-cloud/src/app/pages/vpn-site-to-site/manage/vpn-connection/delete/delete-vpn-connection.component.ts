import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
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
    if (name !== this.nameVpnconnection) {
      return { 'nameMismatch': true };
    }
    return null;
  }

  constructor(private vpnConnectionService: VpnConnectionService,
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
            this.notification.success('Thành công', 'Xoá vpn connection thành công')
            this.onOk.emit(data)
          }
        }, error => {
          this.isVisible = false
          this.isLoading =  false
          this.notification.error('Thất bại', 'Xoá vpn connection thất bại')
        })
      }
    }
  }

  
}
