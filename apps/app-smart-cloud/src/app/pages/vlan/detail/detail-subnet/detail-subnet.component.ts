import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VlanService } from '../../../../shared/services/vlan.service';
import { FormSearchSubnet, Subnet } from '../../../../shared/models/vlan.model';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { debounceTime } from 'rxjs';
import { Location } from '@angular/common'
@Component({
  selector: 'one-portal-detail-subnet',
  templateUrl: './detail-subnet.component.html',
  styleUrls: ['./detail-subnet.component.less']
})
export class DetailSubnetComponent implements OnInit, OnChanges {
  @Input() region: number;
  @Input() project: number;
  @Input() idNetwork: number;


  isLoading: boolean = false;

  valueSubnet: string;

  networkName: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  responseSubnet: BaseResponse<Subnet[]>;

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vlanService: VlanService,
              private location: Location) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('goi lai list subnet');
    if (changes.checkDelete) {
      this.getSubnetByNetwork();
    }
  }

  onInputChangeSubnet(value) {
    this.valueSubnet = value;
    this.getSubnetByNetwork();
  }

  onPageSizeChangeSubnet(value) {
    this.pageSize = value;
    this.getSubnetByNetwork();
  }

  onPageIndexChangeSubnet(value) {
    this.pageIndex = value;
    this.getSubnetByNetwork();
  }

  getSubnetByNetwork() {
    this.isLoading = true;
    let formSearchSubnet = new FormSearchSubnet();
    formSearchSubnet.networkId = this.idNetwork;
    formSearchSubnet.customerId = this.tokenService.get()?.userId;
    formSearchSubnet.region = this.region;
    formSearchSubnet.pageSize = this.pageSize;
    formSearchSubnet.pageNumber = this.pageIndex;
    formSearchSubnet.name = this.valueSubnet;

    this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
      console.log('data-subnet', data);
      this.responseSubnet = data;
      this.isLoading = false;
    }, error => {
      this.responseSubnet = null;
      this.isLoading = false;
    });


  }

  getVlanByNetworkId() {
    this.vlanService.getVlanByNetworkId(this.idNetwork).subscribe(data => {
      this.networkName = data.name;
      this.networkCloudId = data.cloudId
    });
  }

  navigateToCreateSubnet() {
    this.router.navigate(['/app-smart-cloud/vlan/' + this.idNetwork + '/create/subnet']);
  }

  navigateToEditSubnet(idSubnet) {
    this.router.navigate(['/app-smart-cloud/vlan/' + this.idNetwork + '/network/edit/subnet/' + idSubnet]);
  }

  handleOkDeleteSubnet() {
    setTimeout(() => {
      this.vlanService.triggerReload();
      this.getSubnetByNetwork();
      this.getVlanByNetworkId();
    }, 2000)
    // setTimeout(() => {this.getSubnetByNetwork();}, 2000)
    // window.location.reload()
  }

  networkCloudId: string = ''


  ngOnInit() {
    setTimeout(() => {this.getVlanByNetworkId();}, 2000)

    setTimeout(() => {this.getSubnetByNetwork();}, 2000)
  }
}
