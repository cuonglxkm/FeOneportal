import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteVpnService, FormEditVpnService } from 'src/app/shared/models/vpn-service';
import { VpnServiceService } from 'src/app/shared/services/vpn-service.service';


@Component({
  selector: 'one-portal-edit-vpn-service',
  templateUrl: './edit-vpn-service.component.html',
  styleUrls: ['./edit-vpn-service.component.less'],
})
export class EditVpnServiceComponent{
  @Input() region; number
  @Input() project: number
  @Input() vpnServiceId: string
  @Input() vpnServiceName: string
  @Input() vpnServiceStatus: string
  @Input() vpnRouterName: string
  @Output() onOk = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,49}$/)]]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private vpnServiceService: VpnServiceService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
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
            this.notification.success(this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.vpn-service-edit.success'))
            this.onOk.emit(data)
          }
        }, error => {
            this.isVisible = false
            this.isLoading =  false
            this.notification.error(this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.vpn-service-edit.fail'))
        })

    }
  }


}
