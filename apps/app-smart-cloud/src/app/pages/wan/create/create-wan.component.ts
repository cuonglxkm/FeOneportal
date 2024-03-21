import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { WanService } from '../../../shared/services/wan.service';
import { FormSearchWan, Wan } from '../../../shared/models/wan.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';

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
    wanId: FormControl<string>
    ip: FormControl<string>
  }> = this.fb.group({
    wanId: [null as string, [Validators.required]],
    ip: [null as string]
  });

  response: BaseResponse<Wan[]>

  constructor(private fb: NonNullableFormBuilder,
              private wanService: WanService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
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

  }

}
