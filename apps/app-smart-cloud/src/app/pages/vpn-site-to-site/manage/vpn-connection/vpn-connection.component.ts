import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { debounceTime } from 'rxjs';
import { FormSearchVpnConnection, VpnConnectionDTO } from 'src/app/shared/models/vpn-connection';
import { VpnConnectionService } from 'src/app/shared/services/vpn-connection.service';

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

  value: string

  response: BaseResponse<VpnConnectionDTO>

  isLoading: boolean = false

  formSearchVpnConnection: FormSearchVpnConnection = new FormSearchVpnConnection()

  constructor(private vpnConnection: VpnConnectionService,
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
    this.formSearchVpnConnection.projectId = this.project
    this.formSearchVpnConnection.regionId = this.region
    this.formSearchVpnConnection.searchValue =this.value
    this.formSearchVpnConnection.pageSize = this.pageSize
    this.formSearchVpnConnection.currentPage = this.pageIndex
    this.vpnConnection.getVpnConnection(this.formSearchVpnConnection)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
        console.log('data', data)
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
