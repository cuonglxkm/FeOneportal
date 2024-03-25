import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { FormSearchIpsecPolicy, IpsecPolicyDTO } from 'src/app/shared/models/ipsec-policy';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';
import { debounceTime } from 'rxjs';
import { getCurrentRegionAndProject } from '@shared';


@Component({
  selector: 'one-portal-ipsec-policies',
  templateUrl: './ipsec-policies.component.html',
  styleUrls: ['./ipsec-policies.component.less']
})

export class IpsecPoliciesComponent {
  @Input() region: number 
  @Input() project: number 
  @Output() regionChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() projectChange: EventEmitter<any> = new EventEmitter<any>();
  customerId: number

  pageSize: number = 10
  pageIndex: number = 1

  value: string

  response: BaseResponse<IpsecPolicyDTO>

  isLoading: boolean = false

  formSearchIpsecPolicy: FormSearchIpsecPolicy = new FormSearchIpsecPolicy()

  constructor(private ipsecPolicyService: IpsecPolicyService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
}

  refreshParams() {
    this.pageSize = 10;
    this.pageIndex = 1;
  }

  onRegionChange(event: any) {
    this.regionChange.emit(event)
    this.refreshParams();
  }

  onInputChange(value) {
    this.value = value;
    this.getData()
  }

  onProjectChange(event: any) {
    this.projectChange.emit(event)
    this.getData();
  }

  onPageSizeChange(event) {
    this.pageSize = event
    this.refreshParams();
    this.getData();
  }

  onPageIndexChange(event) {
    this.pageIndex = event;
    this.getData();
  }

  getData() {
    this.isLoading = true
    this.formSearchIpsecPolicy.vpcId = this.project
    this.formSearchIpsecPolicy.regionId = this.region
    this.formSearchIpsecPolicy.name =this.value
    this.formSearchIpsecPolicy.pageSize = this.pageSize
    this.formSearchIpsecPolicy.currentPage = this.pageIndex
    this.ipsecPolicyService.getIpsecpolicy(this.formSearchIpsecPolicy)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
        console.log('data', data)
      this.response = data
    })
  }

  handleOkDelete() {
    this.getData()
  }

  ngOnInit() {
    this.getData()
  }
}
