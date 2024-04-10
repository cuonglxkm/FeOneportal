import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteVpnService, FormEditVpnService } from 'src/app/shared/models/vpn-service';
import { VpnServiceService } from 'src/app/shared/services/vpn-service.service';


@Component({
  selector: 'one-portal-extend-vpn-service',
  templateUrl: './edit-vpn-service.component.html',
  styleUrls: ['./edit-vpn-service.component.less'],
})
export class EditVpnServiceComponent{
  @Input() region; number
  @Input() project: number
  @Input() vpnServiceId: string
  @Input() vpnServiceName: string
  @Input() vpnRouterName: string
  @Output() onOk = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private vpnServiceService: VpnServiceService
              ) {
  }


  ngOnInit(): void {
    this.validateForm.controls.name.setValue(this.vpnServiceName)
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
    let formEdit = new FormEditVpnService()
    formEdit.name = this.validateForm.controls.name.value
    formEdit.id = this.vpnServiceId
    formEdit.regionId = this.region
    formEdit.projectId = this.project
    formEdit.customerId = this.tokenService.get()?.userId

    console.log(formEdit);

    if(this.validateForm.valid) {
        this.vpnServiceService.edit(formEdit).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success('Thành công', 'Chỉnh sửa Vpn Service thành công')
            this.onOk.emit(data)
          }
        }, error => {
          if(error.status === 500){
            this.isVisible = false
            this.isLoading =  false
            this.notification.error('Thất bại', 'Không thể chỉnh sửa khi ở trạng thái PENDING_CREATE')
          }else{
            this.isVisible = false
            this.isLoading =  false
            this.notification.error('Thất bại', 'Chỉnh sửa Vpn Service thất bại')
          }

        })

    }
  }


}
