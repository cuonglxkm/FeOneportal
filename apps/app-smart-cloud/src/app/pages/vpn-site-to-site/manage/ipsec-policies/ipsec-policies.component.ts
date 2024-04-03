import { Component, EventEmitter, Inject, Input, Output, SimpleChanges } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { debounceTime } from 'rxjs';
import { FormSearchIpsecPolicy, IpsecPolicyDTO } from 'src/app/shared/models/ipsec-policy';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';


@Component({
  selector: 'one-portal-ipsec-policies',
  templateUrl: './ipsec-policies.component.html',
  styleUrls: ['./ipsec-policies.component.less']
})

export class IpsecPoliciesComponent {
  @Input() region: number 
  @Input() project: number 
  customerId: number

  pageSize: number = 5
  pageIndex: number = 1

  value: string

  response: BaseResponse<IpsecPolicyDTO>

  isLoading: boolean = false

  formSearchIpsecPolicy: FormSearchIpsecPolicy = new FormSearchIpsecPolicy()

  constructor(private ipsecPolicyService: IpsecPolicyService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    ) {
}

  refreshParams() {
    this.pageSize = 5;
    this.pageIndex = 1;
  }
  
  onInputChange(value) {
    this.value = value;
    this.getData()
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
      this.response = data
    })
  }

  handleOkDelete(){
    this.getData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.project && !changes.project.firstChange) {

      this.getData();
    }
    if (changes.region && !changes.region.firstChange) {

      this.refreshParams();
    }
  }
  

  ngOnInit() {
      this.getData();
  }
}
