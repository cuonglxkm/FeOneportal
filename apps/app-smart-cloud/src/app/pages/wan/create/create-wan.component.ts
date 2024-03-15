import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { WanService } from '../../../shared/services/wan.service';
import { FormCreate, FormSearchWan, Wan } from '../../../shared/models/wan.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
        this.notification.success('Thành công', 'Cấp phát IP WAN thành công')
        this.onOk.emit(data)
      } else {
        this.isVisible = false
        this.isLoading = false
        this.notification.error('Thất bại', 'Cấp phát IP WAN thất bại')
      }
    }, error => {
      this.isVisible = false
      this.isLoading = false
      this.notification.error('Thất bại', 'Cấp phát IP WAN thất bại')
    })
  }

}
