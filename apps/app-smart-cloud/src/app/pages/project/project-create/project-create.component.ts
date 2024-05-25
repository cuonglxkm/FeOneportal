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
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';



@Component({
  selector: 'one-portal-project-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.less'],
  animations: [slider]
})

export class ProjectCreateComponent implements OnInit {
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
  messageToggleView: string;

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
  numberBackup: any = 0;
  numberFileSystem: any = 0;
  numberFileScnapsshot: any = 0;
  numberSecurityGroup: any = 0;
  vCPU = 0;
  ram = 0;
  hhd = 0;

  ssd = 0;
  nwNormal = 0;
  routerNormal = 0;
  sgNormal = 0;


  activeBonusService = true;
  activeIP = false;
  trashIP = false;

  activeBackup = false;
  trashBackup = false;
  activeSiteToSite = false;
  trashVpnSiteToSite = false;

  activeLoadBalancer = false;
  trashLoadBalancer = false;

  activeFileStorage = false;
  trashFileStorage = false;

  disableIpConnectInternet = false;
  loadingIpConnectInternet = false;
  ipConnectInternet = 'Không sử dụng';
  loadBalancerId = '';
  siteToSiteId = '';

  trashVpnGpu = false;
  activeVpnGpu = false

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
    vcpu: 0,
    ram: 0,
    hhd: 0,
    ssd: 0,
    vcpuPerUnit: 0,
    ramPerUnit: 0,
    hhdPerUnit: 0,
    ssdPerUnit: 0,

    IpFloating: 0,
    IpFloatingUnit: 0,

    IpPublic: 0,
    IpPublicUnit: 0,
    IpV6: 0,
    IpV6Unit: 0,
    backup: 0,
    backupUnit: 0,
    loadBalancer: 0,
    loadBalancerUnit: 0,
    fileStorage: 0,
    fileStorageUnit: 0,

    filestorageSnapshot: 0,
    filestorageSnapshotUnit: 0,

    siteToSite: 0,
    siteToSiteUnit: 0
  };
  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9_]+$/), Validators.maxLength(20)] }),
    description: new FormControl(''),
    ipConnectInternet: new FormControl(''),
    numOfMonth: new FormControl(1, { validators: [Validators.required] })
    //tab 1
    // ipType: new FormControl('', { validators: [] }),
  });
  // private inputChangeSubject: Subject<number> = new Subject<number>();
  private inputChangeSubject = new Subject<{ value: number, name: string }>();

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 500;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private ipService: IpPublicService) {
    this.inputChangeSubject.pipe(
      debounceTime(800)
    ).subscribe(data => this.checkNumberInput(data.value, data.name));
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.initFlavors();
    this.initVpnSiteToSiteData();
    this.initLoadBalancerData();
    this.loadListIpConnectInternet();
    this.loadInforProjectNormal();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.calculateReal();
    });
    this.onChangeTime();

    this.messageToggleView = "Ẩn dịch vụ bổ sung"
  }

  calculateReal() {
    this.refreshValue();
    if (this.vpcType == '1') {
      let lstIp = this.ipConnectInternet?.split('--');
      let ip = '';
      let ipName = '';
      if (lstIp != null && lstIp != undefined) {
        ip = lstIp[0];
      }
      let numOfMonth = this.form.controls['numOfMonth'].value;
      // let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : 1;
      // let IPFloating = this.selectIndexTab == 1 && this.ipConnectInternet != null && this.ipConnectInternet != '' ? this.numberIpFloating : 0;
      // let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : 0;
      // if ((this.selectIndexTab == 0 && this.offerFlavor != undefined) || (this.selectIndexTab == 1 && this.vCPU != 0 && this.ram != 0)) {

      let IPPublicNum = this.numberIpPublic;
      let IPFloating = this.ipConnectInternet != null && this.ipConnectInternet != 'Không sử dụng' ? this.numberIpFloating : 0;
      // let IPFloating =  this.numberIpFloating;
      let IPV6 = this.numberIpv6;
      // if (( this.offerFlavor != undefined) || ( this.vCPU != 0 && this.ram != 0)) {
      // if ((this.selectIndexTab == 0 && this.offerFlavor != undefined) || (this.selectIndexTab == 1 && this.vCPU != 0 && this.ram != 0)) {
        console.log("offerFlavor", this.offerFlavor)
        if ((this.selectIndexTab == 0 || this.offerFlavor != undefined) || (this.selectIndexTab == 1 || this.vCPU != 0 || this.ram != 0)) {
        console.log("lstIp",lstIp)
        if (lstIp != null && lstIp != undefined && lstIp[1] != null) {
          let listString = lstIp[1].split(' ');
          if (listString.length == 3) {
            ipName = listString[2].trim();
          }
        }

        this.loadingCalculate = true;
        const requestBody = {
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
          loadBalancerOfferId: this.loadBalancerId,
          vpnSiteToSiteOfferId: this.siteToSiteId,
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
        console.log("requestBody", requestBody)
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
    }
  }

  calculate(number: any) {
    if (this.vpcType === '0') {
      this.activeVpc = false;
      this.activeNoneVpc = true;
    } else {
      this.activeVpc = true;
      this.activeNoneVpc = false;
      console.log("number", number)

    }
    this.searchSubject.next('');

  }

  // onInputChange(value: number): void {
  //   console.log("object value", value)
  //   this.inputChangeSubject.next(value);
  // }
  // checkNumberInput(value:number): void {
  // const numericValue = Number(value);
  // if(isNaN(numericValue)|| numericValue%10 !==0){
  //   this.hhd=0;
  //   this.price.hhd =0;
  //   this.price.hhdPerUnit =0
  // }
  // this.calculate(null);
  // }
  onInputChange(value: number, name: string): void {
    console.log("object value", value)
    this.inputChangeSubject.next({ value, name });
  }
  checkNumberInput(value: number, name: string): void {
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue % 10 !== 0) {
      if (name === 'hhd') {
        this.hhd = 0;
        this.price.hhd = 0;
        this.price.hhdPerUnit = 0;
      } else if (name === 'ssd') {
        this.ssd = 0;
        this.price.ssd = 0;
        this.price.ssdPerUnit = 0
      }
      else if (name === 'backup') {
        this.numberBackup = 0;
        this.price.backup = 0;
        this.price.backupUnit = 0;
      } else if (name === 'fileSystem') {
        this.numberFileSystem = 0;
        this.price.fileStorage = 0;
        this.price.fileStorageUnit = 0;
      } else if (name === 'fileSnapshot') {
        this.numberFileScnapsshot = 0;
        this.price.filestorageSnapshot = 0;
        this.price.filestorageSnapshotUnit = 0;
      }
    }
    this.calculate(null);
  }
  selectPackge = '';
  vpcType = '0';
  styleOk = {
    inde: true
      ? '1px solid #0066B3'
      : '1px solid #DADADA',
    height: '160px'
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
                e.description = '0 vCPU / 0 GB RAM / HHH GB SSS / 0 IP';
                e.characteristicValues.forEach((ch) => {
                  if (ch.charName.toUpperCase() == 'CPU') {
                    e.description = e.description.replace(/0 vCPU/g, ch.charOptionValues[0] + ' vCPU');
                  } else if (ch.charName.toUpperCase() == 'RAM') {
                    e.description = e.description.replace(/0 GB RAM/g, ch.charOptionValues[0] + ' GB RAM');
                  } else if (ch.charName == 'Storage') {
                    e.description = e.description.replace(/HHH/g, ch.charOptionValues[0]);
                  } else if (ch.charName == 'VolumeType') {
                    e.description = e.description.replace(/SSS/g, ch.charOptionValues[0]);
                  } else if (ch.charName.toUpperCase() == 'IP') {
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
    this.router.navigate(['/app-smart-cloud/project']);
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
      let lstIp = this.ipConnectInternet?.split('--');
      let ip = '';
      let ipName = '';
      if (lstIp != null && lstIp != undefined) {
        ip = lstIp[0];
      }
      let numOfMonth = this.form.controls['numOfMonth'].value;
      // let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : 1;
      // let IPFloating = this.selectIndexTab == 1 && this.ipConnectInternet != null && this.ipConnectInternet != '' ? this.numberIpFloating : 0;
      // let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : 0;

      let IPPublicNum = this.numberIpPublic;
      let IPFloating = this.ipConnectInternet != null && this.ipConnectInternet != 'Không sử dụng' ? this.numberIpFloating : 0;
      // let IPFloating = this.numberIpFloating;
      let IPV6 = this.numberIpv6;

      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() + Number(numOfMonth) * 30);
      requestBody = {
        quotavCpu: this.vCPU,
        quotaRamInGb: this.ram,
        quotaHddInGb: this.hhd,
        quotaSSDInGb: this.ssd,
        quotaBackupVolumeInGb: this.numberBackup,
        quotaSecurityGroupCount: this.numberSecurityGroup,
        quotaIpPublicCount: IPPublicNum,
        quotaIpFloatingCount: IPFloating,
        quotaIpv6Count: IPV6,
        projectType: this.vpcType,
        quotaNetworkCount: this.numberNetwork,
        quotaRouterCount: this.numberRouter,
        quotaLoadBalancerSDNCount: this.numberLoadBalancer,
        loadBalancerOfferId: this.loadBalancerId,
        vpnSiteToSiteOfferId: this.siteToSiteId,
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
        serviceName: this.form.controls['name'].value,
        description: this.form.controls['description'].value,
        createDate: new Date(),
        expireDate: expiredDate
      };
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
        serviceName: this.form.controls['name'].value,
        description: this.form.controls['description'].value,
        createDate: new Date()
      };
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
          price: this.vpcType == '1' ? this.total?.data?.totalAmount?.amount / numOfMonth : 0,
          serviceDuration: numOfMonth
        }
      ]
    };

    if (this.vpcType == '0') {
      this.ipService.createIpPublic(request).subscribe(
        data => {
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('project.action.creating'));
          this.router.navigate(['/app-smart-cloud/project']);
        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('project.note51'));
        }
      );
    } else {
      var returnPath: string = window.location.pathname;
      this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
    }
  }
  toggleBonusService() {
    if (this.activeBonusService == true) {
      this.activeBonusService = false
      this.messageToggleView = "Xem dịch vụ bổ sung"
    }
    else {
      this.activeBonusService = true
      this.messageToggleView = "Ẩn dịch vụ bổ sung"
    }
  }
  initIP() {
    this.activeIP = true;
    this.trashIP = true;
  }
  deleteIP() {
    this.activeIP = false;
    this.trashIP = false;
    this.price.IpPublic = 0;
    this.price.IpPublicUnit = 0;
    this.price.IpV6 = 0;
    this.price.IpV6Unit = 0;
    this.price.IpFloating = 0;
    this.price.IpFloatingUnit = 0;

    this.numberIpFloating = 0;
    this.numberIpPublic = 0;
    this.numberIpv6 = 0;
  }

  initBackup() {
    this.activeBackup = true;
    this.trashBackup = true;
  }
  deleteBackup() {
    this.activeBackup = false;
    this.trashBackup = false;
    this.price.backup = 0;
    this.price.backupUnit = 0;
    this.numberBackup = 0;
  }


  initLoadBalancer() {
    this.activeLoadBalancer = true;
    this.trashLoadBalancer = true;
  }
  deleteLoadBalancer() {
    this.activeLoadBalancer = false;
    this.trashLoadBalancer = false;
    this.numberLoadBalancer = 0;
    this.price.loadBalancer = 0;
    this.price.loadBalancerUnit = 0;
  }


  initFileStorage() {
    this.activeFileStorage = true;
    this.trashFileStorage = true;
  }
  deleteFileStorage() {
    this.activeFileStorage = false;
    this.trashFileStorage = false;
    this.price.fileStorage = 0;
    this.price.fileStorageUnit = 0;
    this.price.filestorageSnapshot = 0;
    this.price.filestorageSnapshotUnit = 0;
    this.numberFileSystem = 0
    this.numberFileScnapsshot = 0

  }
  initVpnGpu() {
    this.activeVpnGpu = true;
    this.trashVpnGpu = true;
  }
  deleteVpnGpu() {
    this.activeVpnGpu = false;
    this.trashVpnGpu = false;
  }
  openIpSubnet() {
    this.calculate(-1);
  }

  changeTab(event: any) {
    this.totalAmount = 0;
    this.totalPayment = 0;
    this.selectIndexTab = event.index;
    console.log("this.selectIndexTab", this.selectIndexTab)
    this.calculateReal();
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
    this.trashVpnSiteToSite = true;
  }
  deleteVpnSiteToSite() {
    this.activeSiteToSite = false;
    this.trashVpnSiteToSite = false;
    this.price.siteToSite = 0;
    this.price.siteToSiteUnit = 0;
    this.siteToSiteId = '';
  }

  private getPriceEachComponent(data: any) {
    console.log(data.orderItemPrices);
    // let fileStorage = 0;
    for (let item of data.orderItemPrices[0]?.details) {
      if (item.typeName == 'ippublic') {
        this.price.IpPublic = item.totalAmount.amount.toLocaleString();
        console.log("IpPublic", this.price.IpPublic)
        this.price.IpPublicUnit = item.unitPrice.amount.toLocaleString();
        console.log("IpPublic", this.price.IpPublicUnit)
        // this.price.IpPublic = item.unitPrice.amount.toLocaleString();

      } else if (item.typeName == 'ipfloating') {
        this.price.IpFloating = item.totalAmount.amount.toLocaleString();
        this.price.IpFloatingUnit = item.unitPrice.amount.toLocaleString();
        // this.price.IpFloating = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'ipv6') {
        this.price.IpV6 = item.totalAmount.amount.toLocaleString();
        this.price.IpV6Unit = item.unitPrice.amount.toLocaleString();
        // this.price.IpV6 = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'backup') {
        this.price.backup = item.totalAmount.amount.toLocaleString();
        console.log("backup", this.price.backup)
        this.price.backupUnit = item.unitPrice.amount.toLocaleString();
        console.log("backup Unit", this.price.backupUnit)
      } else if (item.typeName == 'filestorage') {
        this.price.fileStorage = item.totalAmount.amount.toLocaleString();
        // console.log("fileStorage",this.price.fileStorage )
        this.price.fileStorageUnit = item.unitPrice.amount.toLocaleString();
        console.log("fileStorageUnit", this.price.fileStorageUnit)
        // fileStorage += item.unitPrice.amount;
      } else if (item.typeName == 'filestorage-snapshot') {
        this.price.filestorageSnapshot = item.totalAmount.amount.toLocaleString();
        this.price.filestorageSnapshotUnit = item.unitPrice.amount.toLocaleString();
        // fileStorage += item.unitPrice.amount;
      } else if (item.typeName == 'loadbalancer') {
        this.price.loadBalancer = item.totalAmount.amount.toLocaleString();
        this.price.loadBalancerUnit = item.unitPrice.amount.toLocaleString();
        // this.price.loadBalancer = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'vpn-site-to-site') {
        this.price.siteToSite = item.totalAmount.amount.toLocaleString();
        this.price.siteToSiteUnit = item.unitPrice.amount.toLocaleString();
        // this.price.siteToSite = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'vcpu') {

        this.price.vcpu = item.totalAmount.amount.toLocaleString();
        this.price.vcpuPerUnit = item.unitPrice.amount.toLocaleString();
        console.log("vcpu", this.price.vcpu)
      } else if (item.typeName == 'ram') {
        this.price.ram = item.totalAmount.amount.toLocaleString();
        this.price.ramPerUnit = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'ssd') {
        this.price.ssd = item.totalAmount.amount.toLocaleString();
        this.price.ssdPerUnit = item.unitPrice.amount.toLocaleString();
      } else if (item.typeName == 'hdd') {
        this.price.hhd = item.totalAmount.amount.toLocaleString();
        this.price.hhdPerUnit = item.unitPrice.amount.toLocaleString();
      }
    }
    // this.price.fileStorage = fileStorage;
  }

  checkPossiblePress(event: KeyboardEvent) {
    const key = event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      event.preventDefault();
    }
  }


  private loadInforProjectNormal() {
    this.instancesService.getListOffers(this.regionId, 'vpc').subscribe(
      data => {
        for (let item of data[0].characteristicValues) {
          if (item.charName == 'network') {
            this.nwNormal = item.charOptionValues[2];

          } else if (item.charName == 'router') {
            this.routerNormal = item.charOptionValues[2];
          } else if (item.charName == 'securitygroup') {
            this.sgNormal = item.charOptionValues[2];
          }
        }
      }
    );
  }

  private refreshValue() {
    this.price.vcpu = 0;
    this.price.vcpuPerUnit = 0;
    this.price.ram = 0;
    this.price.ramPerUnit = 0;
    this.price.hhd = 0;
    this.price.hhdPerUnit = 0;
    this.price.ssd = 0;
    this.price.ssdPerUnit = 0;
    this.price.backup = 0;
    this.price.backupUnit = 0;
    this.price.loadBalancer = 0;
    this.price.loadBalancerUnit = 0;
    this.price.fileStorage = 0;
    this.price.fileStorageUnit = 0;
    this.price.filestorageSnapshot = 0;
    this.price.filestorageSnapshotUnit = 0;
    this.price.siteToSite = 0;
    this.price.siteToSiteUnit = 0;
    this.price.IpFloating = 0;
    this.price.IpFloatingUnit = 0;
    this.price.IpPublic = 0;
    this.price.IpPublicUnit = 0;
    this.price.IpV6 = 0;
    this.price.IpV6Unit = 0;
  }

  // 



}
