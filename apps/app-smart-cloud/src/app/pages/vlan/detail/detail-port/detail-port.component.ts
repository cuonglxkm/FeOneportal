import { Component, Inject, Input, OnInit } from '@angular/core';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { Port } from '../../../../shared/models/vlan.model';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VlanService } from '../../../../shared/services/vlan.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'one-portal-detail-port',
  templateUrl: './detail-port.component.html',
  styleUrls: ['./detail-port.component.less'],
})
export class DetailPortComponent implements OnInit{
  @Input() region: number
  @Input() project: number
  @Input() idNetwork: number

  valuePort: string
  networkName: string

  isLoading: boolean = false

  responsePort: BaseResponse<Port[]>

  pageSize: number = 10
  pageNumber: number = 1

  networkCloudId: string

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vlanService: VlanService) {
  }

  onPageSizeChangePort(value) {
    this.pageSize = value
    this.getPortByNetwork(this.networkCloudId)
  }

  onPageIndexChangePort(value) {
    this.pageNumber = value
    this.getPortByNetwork(this.networkCloudId)
  }
  onInputChangePort(value) {
    this.valuePort = value
  }

  getPortByNetwork(networkCloudId) {
    this.isLoading = true
    this.vlanService.getPortByNetwork(networkCloudId, this.region, this.pageSize, this.pageNumber, this.valuePort)
      .pipe(debounceTime(500))
      .subscribe(data => {
        console.log('port', data)
        this.responsePort = data
        this.isLoading = false
      }, error => {
        this.responsePort = null
        this.isLoading = false
      })
  }

  handleOkAttach() {
    setTimeout(() => {this.getVlanByNetworkId()}, 1000)
  }

  handleOkDetach() {
    setTimeout(() => {this.getVlanByNetworkId()}, 1000)

  }

  handleOkDeletePort() {
    setTimeout(() => {
      this.getVlanByNetworkId()}, 1500)

  }

  handleOkCreatePort() {
    setTimeout(() => {this.getVlanByNetworkId()}, 1000)
  }

  getVlanByNetworkId() {
    this.vlanService.getVlanByNetworkId(this.idNetwork)
      .pipe(debounceTime(1500))
      .subscribe(data => {
      this.networkName = data.name
      this.networkCloudId = data.cloudId
      this.getPortByNetwork(data.cloudId)
    })
  }

  ngOnInit() {
    setTimeout(() => {this.getVlanByNetworkId()}, 2000)
  }
}
