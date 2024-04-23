import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { WanService } from '../../../shared/services/wan.service';
import { FormCreate, FormSearchWan, Wan } from '../../../shared/models/wan.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-create-wan',
  templateUrl: './create-wan.component.html',
  styleUrls: ['./create-wan.component.less'],
})
export class CreateWanComponent {
  @Input() region: number
  @Input() project: number
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  isLoadingSelect: boolean = false

  validateForm: FormGroup<{
    wanId: FormControl<number>
    ip: FormControl<string>
  }> = this.fb.group({
    wanId: [null as number, [Validators.required]],
    ip: [null as string]
  });

  response: BaseResponse<Wan[]>

  constructor(private fb: NonNullableFormBuilder,
              private wanService: WanService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService) {
  }

  showModalCreate() {
    this.isVisible = true
    this.isLoading = false
    this.getListWans()
  }

  handleCancelCreate() {
    this.isVisible = false
    this.isLoading = false
    this.validateForm.reset()
    this.onCancel.emit()
  }

  getListWans() {
    this.isLoading = true
    let formSearch = new FormSearchWan()
    formSearch.regionId = this.region
    formSearch.projectId = this.project
    formSearch.customerId = this.tokenService.get()?.userId
    formSearch.wanName = null
    formSearch.subnetAddress = null
    formSearch.pageSize = 9999
    formSearch.currentPage = 1
    this.wanService.getListWan(formSearch).subscribe(data => {
      this.isLoading = false
      this.response = data
    })
  }

  submitForm() {
    this.isLoading = true
    let formCreate = new FormCreate()
    formCreate.networkId = this.validateForm.controls.wanId.value
    formCreate.regionId = this.region
    formCreate.isFloating = false
    formCreate.ipAddress = this.validateForm.controls.ip.value
    this.wanService.create(formCreate).subscribe(data => {
      if(data) {
        this.isVisible = false
        this.isLoading = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.wan.note11'))
        this.onOk.emit(data)
        this.validateForm.reset()
      } else {
        this.isVisible = false
        this.isLoading = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.wan.note12'))
      }
    }, error => {
      this.isVisible = false
      this.isLoading = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.wan.note12'))
    })
  }

}
