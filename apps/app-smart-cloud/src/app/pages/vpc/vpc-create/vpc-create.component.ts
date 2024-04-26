import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NguCarouselConfig } from '@ngu/carousel';
import { ImageTypesModel, OfferItem } from '../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { InstancesService } from '../../instances/instances.service';
import { getCurrentRegionAndProject } from '@shared';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RegionModel, slider } from '../../../../../../../libs/common-utils/src';
import { IpPublicService } from '../../../shared/services/ip-public.service';
import { OfferDetail } from '../../../shared/models/catalog.model';
import { da } from 'date-fns/locale';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'one-portal-vpc-create',
  templateUrl: './vpc-create.component.html',
  styleUrls: ['./vpc-create.component.less'],
  animations: [slider]
})

export class VpcCreateComponent implements OnInit{
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 2, lg: 4, all: 0 },
    speed: 250,
    point: {
      visible: true
    },
    touch: true,
    loop: true,
    // interval: { timing: 1500 },
    animation: 'lazy'
  };

  listOfferFlavors: OfferItem[] = [];
  listLoadbalancer: OfferDetail[] = [];
  listSiteToSite: OfferDetail[] = [];
  offerFlavor: OfferItem;
  selectedElementFlavor: any;

  regionId: any;
  loadingCalculate = false;
  today = new Date();
  expiredDate = new Date();
  selectedIpConnectInternet: any;
  selectedIpType: any;
  numberNetwork: any = 0;
  numberRouter: any = 0;
  numberIpFloating: any = 0;
  numberIpPublic: any = 0;
  numberIpv6: any = 0;
  numberLoadBalancer: any = 0;
  numberBackup: any = 20;
  numberFileSystem: any = 0;
  numberFileScnapsshot: any = 0;
  numberSecurityGroup: any = 0;
  vCPU = 1;
  ram = 1;
  hhd = 0;
  ssd = 0;


  openIPType = false;
  activeBackup = false;
  activeSiteToSite = false;
  activeLoadBalancer = false;
  activeFileStorage = false;
  disableIpConnectInternet = false;
  loadingIpConnectInternet = false;

  total: any;
  totalAmount = 0;
  totalPayment = 0;
  listIpConnectInternet: any[];
  selectIndexTab: any = 0;
  listIpType = [
    { label: 'IP Public', value: '0' },
    { label: 'Ip Floating', value: '1' },
    { label: 'IpV6', value: '2' }
  ];

  price = {
    IpFloating: 0,
    IpPublic: 0,
    IpV6: 0,
    backup: 0,
    loadBalancer: 0,
    fileStorage: 0,
    siteToSite: 0
  };
  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)] }),
    description: new FormControl(''),
    ipConnectInternet: new FormControl('', { validators: [Validators.required] }),
    numOfMonth: new FormControl(1, { validators: [Validators.required] }),
    //tab 1
    ipType: new FormControl('', { validators: [] }),

    loadBalancerId: new FormControl('', { validators: [] }),
    siteToSiteId: new FormControl('', { validators: [] })
  });

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 500;
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private instancesService: InstancesService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              private notification: NzNotificationService,
              private ipService: IpPublicService) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.initFlavors();
    this.initVpnSiteToSiteData();
    this.initLoadBalancerData();
    this.loadListIpConnectInternet();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.calculateReal();
    });
  }

  calculateReal() {
    if (this.vpcType == '1') {
      let lstIp = this.form.controls['ipConnectInternet'].value.split('--');
      let ip = '';
      let ipName = '';
      if (lstIp != null && lstIp != undefined) {
        ip = lstIp[0];
      }
      let numOfMonth = this.form.controls['numOfMonth'].value;
      let ipType = this.form.controls['ipType'].value;

      let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : (ipType == '0' && this.offerFlavor.ipNumber != undefined ? this.offerFlavor.ipNumber : 0);
      let IPFloating = this.selectIndexTab == 1 ? this.numberIpFloating : (ipType == '1' && this.offerFlavor.ipNumber != undefined ? this.offerFlavor.ipNumber : 0);
      let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : (ipType == '2' ? this.offerFlavor.ipNumber : 0);
      if (ip != '') {
        if ((this.selectIndexTab == 0 && ipType != '' && this.offerFlavor != undefined) || (this.selectIndexTab == 1 && this.vCPU != 0 && this.ram != 0)) {
          let listString = lstIp[1].split(' ');
          if (listString.length == 3) {
            ipName = listString[2].trim();
          }
          this.loadingCalculate = true;
          const requestBody =
            {
              quotavCpu: this.vCPU,
              quotaRamInGb: this.ram,
              quotaHddInGb: this.hhd,
              quotaSSDInGb: this.ssd,
              quotaBackupVolumeInGb: this.numberBackup,
              quotaSecurityGroupCount: this.numberSecurityGroup,
              projectType: this.vpcType,
              // quotaKeypairCount: 0,// NON
              // quotaVolumeSnapshotCount: 0,//NON
              quotaIpPublicCount: IPPublicNum,
              quotaIpFloatingCount: IPFloating,
              quotaNetworkCount: this.numberNetwork,
              quotaRouterCount: this.numberRouter,
              quotaLoadBalancerSDNCount: this.numberLoadBalancer,
              loadBalancerOfferId: this.form.controls['loadBalancerId'].value,
              vpnSiteToSiteOfferId: this.form.controls['siteToSiteId'].value,
              quotaShareInGb: this.numberFileSystem,
              QuotaShareSnapshotInGb: this.numberFileScnapsshot,
              publicNetworkId: ip,
              publicNetworkAddress: ipName,
              quotaIPv6Count: IPV6,
              typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.VpcCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
              serviceType: 12,
              serviceInstanceId: 0,
              customerId: this.tokenService.get()?.userId,
              offerId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? 0 : this.offerFlavor.id) : 0,
              actionType: 0,
              regionId: this.regionId,
              serviceName: this.form.controls['name'].value
            };
          const request = {
            orderItems: [
              {
                orderItemQuantity: 1,
                specificationString: JSON.stringify(requestBody),
                specificationType: 'vpc_create',
                sortItem: 0,
                serviceDuration: numOfMonth
              }
            ]
          };
          this.ipService.getTotalAmount(request)
            .pipe(finalize(() => {
              this.loadingCalculate = false;
            }))
            .subscribe(
              data => {
                this.total = data;
                this.totalAmount = this.total.data.totalAmount.amount.toLocaleString();
                this.totalPayment = this.total.data.totalPayment.amount.toLocaleString();
                this.getPriceEachComponent(data.data);
              }
            );
        } else {
          this.total = undefined;
        }
      } else {
        this.total = undefined;
      }
    }
  }
  calculate(number: any) {
    if (this.vpcType === '0') {
      this.activeVpc = false;
      this.activeNoneVpc = true;
    } else {
      this.activeVpc = true;
      this.activeNoneVpc = false;
    }
    this.searchSubject.next('');
  }

  selectPackge = '';
  vpcType = '0';
  styleOk = {
    inde: true
      ? '1px solid #0066B3'
      : '1px solid #DADADA',
    height: '160px',
  };

  cardHeight = '95px';
  activeNoneVpc = true;
  activeVpc = false;

  onInputFlavors(event: any, name: any) {
    this.selectPackge = name;
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === event
    );
    this.selectedElementFlavor = 'flavor_' + event;
    this.calculate(null);
  }

  initFlavors(): void {
    this.instancesService.getDetailProductByUniqueName('vpc-oneportal')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductId(data[0].id, this.regionId)
            .subscribe((data: any) => {
              this.listOfferFlavors = data.filter(
                (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
              );

              this.listOfferFlavors.forEach((e: OfferItem) => {
                e.description = '0 CPU / 0 GB RAM / 0 GB HHD / 0 IP';
                e.characteristicValues.forEach((ch) => {
                  if (ch.charName.toUpperCase() == 'CPU') {
                    e.description.replace(ch.charOptionValues[0] + ' CPU', '0 CPU');
                  }
                  if (ch.charName == 'RAM') {
                    e.description = e.description.replace(/0 GB RAM/g, ch.charOptionValues[0] + ' GB RAM');
                  }
                  if (ch.charName == 'HHD') {
                    e.description = e.description.replace(/0 GB HHD/g, ch.charOptionValues[0] + ' GB HHD');
                  }
                  if (ch.charName == 'IP') {
                    e.description = e.description.replace(/0 IP/g, ch.charOptionValues[0] + ' IP');
                    e.ipNumber = ch.charOptionValues[0];
                  }
                });
              });
              this.cdr.detectChanges();
            });
        }
      );
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.router.navigate(['/app-smart-cloud/vpc']);
  }

  onChangeTime() {
    const dateNow = new Date();
    dateNow.setDate(dateNow.getDate() + Number(this.form.controls['numOfMonth'].value * 30));
    this.expiredDate = dateNow;
    this.calculate(null);
  }

  createIpPublic() {
    let numOfMonth = this.form.controls['numOfMonth'].value;
    let requestBody = {};
    if (this.vpcType == '1') {
      let lstIp = this.form.controls['ipConnectInternet'].value.split('--');
      let ip = '';
      let ipName = '';
      if (lstIp != null && lstIp != undefined) {
        ip = lstIp[0];
        let listString = lstIp[1].split(' ');
        if (listString.length == 3) {
          ipName = listString[2].trim();
        }
      }
      let ipType = this.form.controls['ipType'].value;

      let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : (ipType == '0' && this.offerFlavor.ipNumber != undefined ? this.offerFlavor.ipNumber : 0);
      let IPFloating = this.selectIndexTab == 1 ? this.numberIpFloating : (ipType == '1' && this.offerFlavor.ipNumber != undefined ? this.offerFlavor.ipNumber : 0);
      let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : (ipType == '2' ? this.offerFlavor.ipNumber : 0);
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() + Number(numOfMonth) * 30);
      requestBody = {
        quotavCpu: this.vCPU,
        quotaRamInGb: this.ram,
        quotaHddInGb: this.hhd,
        quotaSSDInGb: this.ssd,
        quotaBackupVolumeInGb: this.numberBackup,
        quotaSecurityGroupCount: this.numberSecurityGroup,
        // quotaKeypairCount: null,// NON
        // quotaVolumeSnapshotCount: null,//NON
        quotaIpPublicCount: IPPublicNum,
        quotaIpFloatingCount: IPFloating,
        quotaIpv6Count: IPV6,
        projectType: this.vpcType,
        quotaNetworkCount: this.numberNetwork,
        quotaRouterCount: this.numberRouter,
        quotaLoadBalancerSDNCount: this.numberLoadBalancer,
        loadBalancerOfferId: this.form.controls['loadBalancerId'].value,
        vpnSiteToSiteOfferId: this.form.controls['siteToSiteId'].value,
        quotaShareInGb: this.numberFileSystem,
        quotaShareSnapshotInGb: this.numberFileScnapsshot,
        publicNetworkId: ip,
        publicNetworkAddress: ipName,
        typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.VpcCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
        serviceType: 12,
        serviceInstanceId: 0,
        customerId: this.tokenService.get()?.userId,
        offerId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? 0 : this.offerFlavor.id) : 0,
        actionType: 0,
        regionId: this.regionId,
        serviceName: 'vpc' + this.tokenService.get()?.userId + '-' + this.form.controls['name'].value,
        description: this.form.controls['description'].value,
        createDate: new Date(),
        expireDate: expiredDate
      }
    } else {
      requestBody = {
        projectType: this.vpcType,
        typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.VpcCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
        serviceType: 12,
        serviceInstanceId: 0,
        customerId: this.tokenService.get()?.userId,
        offerId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? 0 : this.offerFlavor.id) : 0,
        actionType: 0,
        regionId: this.regionId,
        serviceName: 'vpc' + this.tokenService.get()?.userId + '-' + this.form.controls['name'].value,
        description: this.form.controls['description'].value,
        createDate: new Date()
      }
    }

    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: 'Tạo VPC',
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(requestBody),
          specificationType: 'vpc_create',
          price: 0,
          serviceDuration: numOfMonth
        }
      ]
    };

    if (this.vpcType == '0') {
      this.ipService.createIpPublic(request).subscribe(
        data => {
          this.notification.success('Thành công', 'Tạo dự án thành công');
          this.router.navigate(['/app-smart-cloud/vpc']);
        },
        error => {
          this.notification.error('Thất bại', 'Tạo dự án thất bại')
        }
      )
    } else {
      var returnPath: string = window.location.pathname;
      this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
    }
  }

  initBackup() {
    this.activeBackup = true;
  }

  initLoadBalancer() {
    this.activeLoadBalancer = true;
  }

  initFileStorage() {
    this.activeFileStorage = true;
  }

  openIpSubnet() {
    let num = this.form.controls['ipConnectInternet'].value;
    if (num != undefined && num != null && num != '') {
      this.openIPType = true;
    }

    this.calculate(-1);
  }

  changeTab(event: any) {
    this.selectIndexTab = event.index;
  }

  loadListIpConnectInternet() {
    this.loadingIpConnectInternet = true;
    this.disableIpConnectInternet = true;
    this.instancesService.getAllIPSubnet(this.regionId)
      .pipe(finalize(() => {
        this.disableIpConnectInternet = false;
        this.loadingIpConnectInternet = false;
      }))
      .subscribe(
        data => {
          this.listIpConnectInternet = data;
        }
      );
  }

  private initVpnSiteToSiteData() {
    this.instancesService.getDetailProductByUniqueName('vpns2s')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductId(data[0].id, this.regionId)
            .subscribe((data: any) => {
              this.listSiteToSite = data;
            });
        }
      );
  }

  private initLoadBalancerData() {
    this.instancesService.getDetailProductByUniqueName('loadbalancer-sdn')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductId(data[0].id, this.regionId)
            .subscribe((data: any) => {
              this.listLoadbalancer = data;
            });
        }
      );
  }

  initVpnSiteToSite() {
    this.activeSiteToSite = true;
  }

  private getPriceEachComponent(data: any) {
    console.log(data.orderItemPrices);
    let fileStorage = 0
    for (let item of data.orderItemPrices[0]?.details) {
      if (item.typeName == 'ippublic') {
        this.price.IpPublic = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'ipfloating') {
        this.price.IpFloating = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'ipv6') {
        this.price.IpV6 = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'backup') {
        this.price.backup = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'filestorage') {
        fileStorage += item.unitPrice.amount;
      } else if (item.typeName == 'filestorage-snapshot') {
        fileStorage += item.unitPrice.amount;
      } else if (item.typeName == 'loadbalancer') {
        this.price.loadBalancer = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'vpn-site-to-site') {
        this.price.siteToSite = item.unitPrice.amount.toLocaleString();
      }
    }
    this.price.fileStorage = fileStorage;
  }

  checkPossiblePress(event: KeyboardEvent) {
    const key = event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      event.preventDefault();
    }
  }
}
