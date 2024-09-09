import { Component, EventEmitter, Inject, Input, Output, SimpleChanges } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { debounceTime, Subject } from 'rxjs';
import { FormSearchIpsecPolicy, IpsecPolicyDTO } from 'src/app/shared/models/ipsec-policy';
import { IpsecPolicyService } from 'src/app/shared/services/ipsec-policy.service';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { TimeCommon } from 'src/app/shared/utils/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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

  value: string = ''

  response: BaseResponse<IpsecPolicyDTO>

  isLoading: boolean = false

  formSearchIpsecPolicy: FormSearchIpsecPolicy = new FormSearchIpsecPolicy()

  searchDelay = new Subject<boolean>();
  isCreatePermission: boolean = false;
  constructor(private ipsecPolicyService: IpsecPolicyService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private policyService: PolicyService
    ) {
}

  refreshParams() {
    this.pageSize = 5;
    this.pageIndex = 1;
  }
  pageSizeFixed = 5
  search(search: string) {  
    this.value = search.trim();
    this.refreshParams()
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
    this.formSearchIpsecPolicy.name =this.value.trim()
    this.formSearchIpsecPolicy.pageSize = this.pageSize
    this.formSearchIpsecPolicy.currentPage = this.pageIndex
    this.ipsecPolicyService.getIpsecpolicy(this.formSearchIpsecPolicy)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false;
      this.response = data;
      this.isCreatePermission = this.policyService.hasPermission("vpnsitetosites:CreateIPsecPolicy");
    }, error => {
      this.isLoading = false;
      this.response = null;
      console.log(error);
      if(error.status == 403){
        this.notification.error(
          error.statusText,
          this.i18n.fanyi('app.non.permission')
        );
      }
      this.isCreatePermission = this.policyService.hasPermission("vpnsitetosites:CreateIPsecPolicy");
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
      this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {   
        this.refreshParams()  
        this.getData();
      });
  }
}
