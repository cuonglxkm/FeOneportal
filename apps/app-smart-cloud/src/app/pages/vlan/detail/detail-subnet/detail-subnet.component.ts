import { Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VlanService } from '../../../../shared/services/vlan.service';
import { FormSearchSubnet, Subnet } from '../../../../shared/models/vlan.model';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-detail-subnet',
  templateUrl: './detail-subnet.component.html',
  styleUrls: ['./detail-subnet.component.less'],
})
export class DetailSubnetComponent implements OnInit{
  @Input() region: number
  @Input() project: number
  @Input() idNetwork: number


  isLoading: boolean = false

  valueSubnet: string

  networkName: string

  pageSize: number = 10
  pageIndex: number = 1

  responseSubnet: BaseResponse<Subnet[]>

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vlanService: VlanService) {
  }

  onInputChangeSubnet(value) {
    this.valueSubnet = value
    this.getSubnetByNetwork()
  }

  onPageSizeChangeSubnet(value) {
    this.pageSize = value
    this.getSubnetByNetwork()
  }

  onPageIndexChangeSubnet(value) {
    this.pageIndex = value
    this.getSubnetByNetwork()
  }

  getSubnetByNetwork() {
    this.isLoading = true
    let formSearchSubnet = new FormSearchSubnet()
    formSearchSubnet.networkId = this.idNetwork
    formSearchSubnet.customerId = this.tokenService.get()?.userId
    formSearchSubnet.region = this.region
    formSearchSubnet.pageSize = this.pageSize
    formSearchSubnet.pageNumber = this.pageIndex
    formSearchSubnet.name = this.valueSubnet

    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
      console.log('data-subnet', data)
      this.responseSubnet = data
      this.isLoading = false
    })
  }

  getVlanByNetworkId() {
    this.vlanService.getVlanByNetworkId(this.idNetwork).subscribe(data => {
      this.networkName = data.name
    })
  }

  navigateToCreateSubnet() {
    this.router.navigate(['/app-smart-cloud/vlan/' + this.idNetwork + '/create/subnet'])
  }

  navigateToEditSubnet(idSubnet) {
    this.router.navigate(['/app-smart-cloud/vlan/'+ this.idNetwork +'/network/edit/subnet/' + idSubnet])
  }

  handleOkDeleteSubnet() {
    this.getSubnetByNetwork()
  }

  ngOnInit() {
    this.getVlanByNetworkId()
    this.getSubnetByNetwork()
  }
}
