import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { debounceTime, Subject } from 'rxjs';
import { FormSearchVpnService, VpnServiceDTO } from 'src/app/shared/models/vpn-service';
import { VpnServiceService } from 'src/app/shared/services/vpn-service.service';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { TimeCommon } from 'src/app/shared/utils/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-vpn-service',
  templateUrl: './vpn-service.component.html',
  styleUrls: ['./vpn-service.component.less']
})

export class VpnService {
  @Input() region: number 
  @Input() project: number 
  customerId: number

  pageSize: number = 5
  pageIndex: number = 1

  value: string = ''
  pageSizeFixed = 5
  response: BaseResponse<VpnServiceDTO>

  isLoading: boolean = false

  formSearchVpnService: FormSearchVpnService = new FormSearchVpnService()

  searchDelay = new Subject<boolean>();
  isCreatePermission: boolean = false;
  constructor(private vpnServiceService: VpnServiceService,
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
    this.formSearchVpnService.projectId = this.project
    this.formSearchVpnService.regionId = this.region
    this.formSearchVpnService.name =this.value.trim()
    this.formSearchVpnService.pageSize = this.pageSize
    this.formSearchVpnService.currentPage = this.pageIndex
    this.vpnServiceService.getVpnService(this.formSearchVpnService)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false;
      this.response = data;
      this.isCreatePermission = this.policyService.hasPermission("vpnsitetosites:VPNCreateVpnService");
    }, error => {
      this.isLoading = false;
      this.response = null;
      console.log(error);
      if(error.status == 403){
        this.notification.error(
          error.statusText,
          this.i18n.fanyi('app.non.permission', { serviceName: 'Danh sách VPN Service' })
        );
      }
      this.isCreatePermission = this.policyService.hasPermission("vpnsitetosites:VPNCreateVpnService");
    })
  }

  handleOkDelete(){
    this.getData()
  }
  
  handleOkEdit(){
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
