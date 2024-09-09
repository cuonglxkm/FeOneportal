import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { debounceTime, Subject } from 'rxjs';
import { FormSearchVpnConnection, VpnConnectionDTO } from 'src/app/shared/models/vpn-connection';
import { VpnConnectionService } from 'src/app/shared/services/vpn-connection.service';
import { TimeCommon } from 'src/app/shared/utils/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-vpn-connection',
  templateUrl: './vpn-connection.component.html',
  styleUrls: ['./vpn-connection.component.less']
})

export class VpnConnection {
  @Input() region: number 
  @Input() project: number 
  customerId: number

  pageSize: number = 5
  pageIndex: number = 1
  pageSizeFixed = 5
  value: string = ''

  response: BaseResponse<VpnConnectionDTO>

  isLoading: boolean = false

  formSearchVpnConnection: FormSearchVpnConnection = new FormSearchVpnConnection()

  searchDelay = new Subject<boolean>();
  isCreatePermission: boolean = false;
  constructor(private vpnConnection: VpnConnectionService,
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
    this.formSearchVpnConnection.projectId = this.project
    this.formSearchVpnConnection.regionId = this.region
    this.formSearchVpnConnection.searchValue =this.value.trim()
    this.formSearchVpnConnection.pageSize = this.pageSize
    this.formSearchVpnConnection.currentPage = this.pageIndex
    this.vpnConnection.getVpnConnection(this.formSearchVpnConnection)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
      const transformedData = data.records.map(record => {  
        const [firstNetWork, ...remainingNetWorks] = record.localNetwork;
        console.log(firstNetWork);
        console.log(record.localNetwork);
        
        return {
          ...record,
          firstNetWork,  
          localNetwork: remainingNetWorks  
        };
      });

    
      this.response = transformedData

      console.log(this.response);
      this.isCreatePermission = this.policyService.hasPermission("vpnsitetosites:VPNCreateVpnConnection");
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
      this.isCreatePermission = this.policyService.hasPermission("vpnsitetosites:VPNCreateVpnConnection");
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
