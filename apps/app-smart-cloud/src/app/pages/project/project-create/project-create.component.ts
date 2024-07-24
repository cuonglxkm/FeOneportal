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
import { OfferDetail, SupportService } from '../../../shared/models/catalog.model';
import { da } from 'date-fns/locale';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject } from 'rxjs';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { Interface } from 'readline';
import { VpcService } from 'src/app/shared/services/vpc.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { LoadingService } from '@delon/abc/loading';
import { RegionID } from 'src/app/shared/enums/common.enum';




@Component({
  selector: 'one-portal-project-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.less'],
  animations: [slider]
})


export class ProjectCreateComponent implements OnInit {
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 2, lg: 3, all: 0 },
    speed: 250,
    point: {
      visible: true
    },
    touch: true,
    loop: true,
    // interval: { timing: 1500 },
    animation: 'lazy'
  };
  iconToggle: string;

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
  numberIpFloating: number = 0;
  numberIpPublic: number = 0;
  numberIpv6: number = 0;
  numberLoadBalancer: any = 0;
  numberBackup: number = 0;
  numberFileSystem: number = 0;
  numberFileScnapsshot: number = 0;
  numberSecurityGroup: any = 0;

  numberSnapshothdd: number = 0;
  numberSnapshotssd: number = 0;


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
  ipConnectInternet = '';
  loadBalancerId: number;
  siteToSiteId: number;

  trashVpnGpu = false;
  activeVpnGpu = false

  activeSnapshot = false;
  trashSnapshot = false;

  numOfMonth: number;
  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;
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
    snapshothdd: 0,
    snapshothddUnit: 0,
    snapshotssd: 0,
    snapshotssdUnit: 0,

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

  gpuQuotasGobal: { GpuOfferId: number, GpuCount: number, GpuType: string, GpuPrice: number, GpuPriceUnit: number }[] = [];


  prices: any;

  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;

  loadBalancerName: string;
  sitetositeName: string;
  listTypeCatelogOffer: any;

  // numbergpu: number[] = [];
  // maxTotal: number = 8;
  keySSD: boolean = true;

  isRequired: boolean = true;

  isLoading = false;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  productByRegion: any
  // catalogStatus: { [key: string]: boolean } = {};

  typeIp: boolean;
  typeIpv6: boolean;
  typeVolume_snapshot_hdd: boolean;
  typeVolume_snapshot_ssd: boolean;
  typeBackup_volume: boolean;
  typeLoadbalancer_sdn: boolean;
  typeFile_storage: boolean;
  typeFile_storage_snapshot: boolean;
  typeVpns2s: boolean;
  typeVm_gpu: boolean;


  serviceActiveByRegion: SupportService[] = [];
  // catalogs: string[] = ['ip', 'ipv6','volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-volume', 'loadbalancer-sdn', 'file-storage','file-storage-snapshot', 'vpns2s','vm-gpu'];

  isShowAlertGpu: boolean;
  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9_]+$/), Validators.maxLength(50)] }),
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
    private catalogService: CatalogService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private ipService: IpPublicService,
    private vpc: VpcService,
    private orderService: OrderService,
    private loadingSrv: LoadingService,

  ) {
    this.inputChangeSubject.pipe(
      debounceTime(800)
    ).subscribe(data => this.checkNumberInput(data.value, data.name));

  }
  url = window.location.pathname;
  hasRoleSI: boolean
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.regionId = RegionID.NORMAL;
      } else {
        this.regionId = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.regionId = RegionID.ADVANCE;
    }
    this.initFlavors();
    this.initVpnSiteToSiteData();
    this.initLoadBalancerData();
    this.loadListIpConnectInternet();
    this.loadInforProjectNormal();
    this.calculateReal();
    this.hasRoleSI = localStorage.getItem('role').includes('SI')
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.calculateReal();
    });
    // this.onChangeTime();
    this.getStepBlock('BLOCKSTORAGE')

    this.iconToggle = "icon_circle_minus"
    this.numOfMonth = this.form.controls['numOfMonth'].value;

    this.getProductActivebyregion();

    this.getCatelogOffer();

  }
  offervCpu: number;

  calculateReal() {
    this.refreshValue();
    if (this.vpcType == '1') {
      if ((this.selectIndexTab == 1 && this.ssd == 0) || (this.selectIndexTab == 0 && this.keySSD == false || (this.selectIndexTab == 0 && !this.offerFlavor))) {
        this.isShowAlertGpu = true
      }
      else {
        this.isShowAlertGpu = false
      }

      let lstIp = this.ipConnectInternet?.split('--');
      let ip = '';
      let ipName = '';
      if (lstIp != null && lstIp != undefined) {
        ip = lstIp[0];
      }


      let IPPublicNum = this.numberIpPublic;
      let IPFloating = this.ipConnectInternet != null && this.ipConnectInternet != '' ? this.numberIpFloating : 0;
      // let IPFloating =  this.numberIpFloating;
      let IPV6 = this.numberIpv6;
      // if (( this.offerFlavor != undefined) || ( this.vCPU != 0 && this.ram != 0)) {
      // if ((this.selectIndexTab == 0 && this.offerFlavor != undefined) || (this.selectIndexTab == 1 && this.vCPU != 0 && this.ram != 0)) {
      console.log("offerFlavor", this.offerFlavor)



      if ((this.selectIndexTab == 0 || this.offerFlavor != undefined) || (this.selectIndexTab == 1 || (this.vCPU != 0 && this.ram != 0))) {
        console.log("lstIp", lstIp)
        if (lstIp != null && lstIp != undefined && lstIp[1] != null) {
          console.log("lstIp 567", lstIp)
          let listString = lstIp[1].split(' ');
          console.log("listString", listString)
          if (listString.length == 3) {
            ipName = listString[2].trim();
            console.log("ipName", ipName)
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
          // quotaIpPublicCount: (this.selectIndexTab==0 && this.offerFlavor != null)  ? (IPPublicNum +1) :  IPPublicNum,
          quotaIpPublicCount: this.numberIpPublic,
          quotaIpFloatingCount: this.numberIpFloating,
          quotaIpv6Count: this.numberIpv6,
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


          gpuQuotas: this.gpuQuotasGobal,
          quotaVolumeSnapshotHddInGb: this.numberSnapshothdd,
          quotaVolumeSnapshotSsdInGb: this.numberSnapshotssd,

          // typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.VpcCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
          // serviceType: 12,
          serviceInstanceId: 0,
          customerId: this.tokenService.get()?.userId,
          offerId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? 0 : this.offerFlavor.id) : 0,


          actionType: 0,
          regionId: this.regionId,
          serviceName: this.form.controls['name'].value,
          // this.form.controls['name'].value
        };
        console.log("requestBody", requestBody)
        const request = {
          orderItems: [
            {
              orderItemQuantity: 1,
              specificationString: JSON.stringify(requestBody),
              specificationType: 'vpc_create',
              sortItem: 0,
              serviceDuration: this.numOfMonth
            }
          ]
        };
        this.vpc.getTotalAmount(request)
          .pipe(finalize(() => {
            this.loadingCalculate = false;
          }))
          .subscribe(
            data => {
              this.total = data;
              this.totalAmount = this.total.data.totalAmount.amount
              this.totalPayment = this.total.data.totalPayment.amount;
              this.totalVAT = this.total.data.totalVAT.amount;
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

    }
    this.searchSubject.next('');

  }
  getStepBlock(name: string) {
    this.vpc.getStepBlock(name).subscribe((res: any) => {
      const valuestring: any = res.valueString;
      const parts = valuestring.split("#")
      this.minBlock = parseInt(parts[0]);
      this.stepBlock = parseInt(parts[1]);
      this.maxBlock = parseInt(parts[2]);
    })
  }
  messageNotification: string;

  onInputChange(value: number, name: string): void {
    console.log("object value", value)
    this.inputChangeSubject.next({ value, name });
    this.checkRequired()
  }

  checkNumberInput(value: number, name: string): void {
    const messageStepNotification = `Số lượng phải chia hết cho  ${this.stepBlock} `;
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      this.notification.warning('', messageStepNotification);
      return;
    }
    let adjustedValue = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
    if (adjustedValue > this.maxBlock) {
      adjustedValue = Math.floor(this.maxBlock / this.stepBlock) * this.stepBlock;
    } else if (adjustedValue < this.minBlock) {
      adjustedValue = this.minBlock;
    }
    if (numericValue !== adjustedValue) {
      this.notification.warning('', messageStepNotification);
    }
    switch (name) {
      case "hhd":
        this.hhd = adjustedValue;
        break;
      case "ssd":
        this.ssd = adjustedValue;
        break;
      case "backup":
        this.numberBackup = adjustedValue;
        break;
      case "fileSystem":
        this.numberFileSystem = adjustedValue;
        break;
      case "fileSnapshot":
        this.numberFileScnapsshot = adjustedValue;
        break;
      case "snapshothdd":
        this.numberSnapshothdd = adjustedValue;
        break;
      case "snapshotssd":
        this.numberSnapshotssd = adjustedValue;
        break;
    }
    if (numericValue !== adjustedValue) {
      this[name] = adjustedValue;
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
    console.log("objeselectedElementFlavorct", this.selectedElementFlavor)
    this.checkFlavor()
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
                    console.log(" e.ipNumber", e.ipNumber)
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
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onChangeTime(numberMonth: number) {

    this.numOfMonth = numberMonth;
    console.log("numOfMonth123", this.numOfMonth)
    // const dateNow = new Date();
    // dateNow.setDate(dateNow.getDate() + Number(this.form.controls['numOfMonth'].value * 30));
    // console.log("this.numOfMonth hh",this.numOfMonth)
    // this.expiredDate = dateNow;
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
      let IPFloating = this.ipConnectInternet != null && this.ipConnectInternet != '' ? this.numberIpFloating : 0;
      // let IPFloating = this.numberIpFloating;
      let IPV6 = this.numberIpv6;

      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() + Number(numOfMonth) * 30);
      if ((this.selectIndexTab == 0 || this.offerFlavor != undefined) || (this.selectIndexTab == 1 || (this.vCPU != 0 && this.ram != 0))) {
        console.log("lstIp", lstIp)
        if (lstIp != null && lstIp != undefined && lstIp[1] != null) {
          let listString = lstIp[1].split(' ');
          console.log("listString", listString)
          if (listString.length == 3) {
            ipName = listString[2].trim();
            console.log("ipName", ipName)
          }
        }
        requestBody = {
          quotavCpu: this.vCPU,
          quotaRamInGb: this.ram,
          quotaHddInGb: this.hhd,
          quotaSSDInGb: this.ssd,

          quotaBackupVolumeInGb: this.numberBackup,
          quotaSecurityGroupCount: this.numberSecurityGroup,
          quotaIpPublicCount: this.numberIpPublic,
          quotaIpFloatingCount: this.numberIpFloating,
          quotaIpv6Count: this.numberIpv6,

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

          gpuQuotas: this.gpuQuotasGobal,
          quotaVolumeSnapshotHddInGb: this.numberSnapshothdd,
          quotaVolumeSnapshotSsdInGb: this.numberSnapshotssd,

          typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.VpcCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
          serviceType: 12,
          serviceInstanceId: 0,
          customerId: this.tokenService.get()?.userId,
          offerId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? 0 : this.offerFlavor.id) : 0,
          actionType: 0,
          regionId: this.regionId,
          serviceName: this.form.controls['name'].value,
          // serviceName:'',
          description: this.form.controls['description'].value,
          createDate: new Date(),
          expireDate: expiredDate
        };
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
        serviceName: this.form.controls['name'].value,
        // serviceName:null,
        description: this.form.controls['description'].value,
        createDate: new Date()
      };
    }

    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: 'Tạo VPC',
      totalPayment: this.total?.data?.totalPayment.amount,
      totalVAT: this.total?.data?.totalVAT.amount,
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
      console.log("ha")
      this.vpc.createIpPublic(request).subscribe(
        data => {
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('project.action.creating'));
          this.router.navigate(['/app-smart-cloud/project']);
        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('project.note51'));
        }
      );
    } else {
      this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
      this.orderService
        .validaterOrder(request)
        .pipe(
          finalize(() => {
            this.loadingSrv.close()
            // this.isLoading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (result) => {
            if (result.success) {
              var returnPath: string = window.location.pathname;
              localStorage.removeItem("projects");
              localStorage.removeItem("projectId");
              this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
              if(this.hasRoleSI) {
                this.vpc.createIpPublic(request).subscribe(
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

            } else {
              this.isVisiblePopupError = true;
              this.errorList = result.data;
            }
          },
          error: (error) => {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              error.error.detail
            );
          },
        });
      // var returnPath: string = window.location.pathname;
      // this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
    }
  }
  toggleBonusService() {
    if (this.activeBonusService == true) {
      this.activeBonusService = false
      this.iconToggle = "icon_circle_plus"
    }
    else {
      this.activeBonusService = true
      this.iconToggle = "icon_circle_minus"
    }
  }
  initIP() {
    this.activeIP = true;
    this.trashIP = true;
    // this.calculate(null)
  }
  deleteIP() {
    this.activeIP = false;
    this.trashIP = false;

    this.ipConnectInternet = '';


    this.price.IpPublic = 0;
    this.price.IpPublicUnit = 0;
    this.price.IpV6 = 0;
    this.price.IpV6Unit = 0;
    this.price.IpFloating = 0;
    this.price.IpFloatingUnit = 0;

    this.numberIpFloating = 0;
    this.numberIpPublic = 0;
    this.numberIpv6 = 0;
    this.calculate(null)
  }

  initBackup() {
    this.activeBackup = true;
    this.trashBackup = true;
    // this.price.backupUnit=

  }
  deleteBackup() {
    this.activeBackup = false;
    this.trashBackup = false;

    this.numberBackup = 0;
    this.calculate(null)
  }


  initLoadBalancer() {
    this.activeLoadBalancer = true;
    this.trashLoadBalancer = true;
    this.loadBalancerId = this.listLoadbalancer[0].id;
    this.findNameLoadBalance(this.loadBalancerId);
    // this.calculate(null)
  }
  deleteLoadBalancer() {
    this.activeLoadBalancer = false;
    this.trashLoadBalancer = false;
    this.numberLoadBalancer = 0;
    this.loadBalancerId = null;
    this.calculate(null)
  }


  initFileStorage() {
    this.activeFileStorage = true;
    this.trashFileStorage = true;
  }
  deleteFileStorage() {
    this.activeFileStorage = false;
    this.trashFileStorage = false;
    this.numberFileSystem = 0
    this.numberFileScnapsshot = 0
    this.calculate(null)

  }
  initVpnSiteToSite() {
    this.activeSiteToSite = true;
    this.trashVpnSiteToSite = true;
    this.siteToSiteId = this.listSiteToSite[1].id;
    this.findNameSiteToSite(this.siteToSiteId)

    // this.calculate(null)
  }
  deleteVpnSiteToSite() {
    this.activeSiteToSite = false;
    this.trashVpnSiteToSite = false;
    this.siteToSiteId = null
    this.sitetositeName = ""
    this.calculate(null)
  }
  initVpnGpu() {
    this.activeVpnGpu = true;
    this.trashVpnGpu = true;

    // this.calculate(null);

  }
  deleteVpnGpu() {
    this.activeVpnGpu = false;
    this.trashVpnGpu = false;
    this.getCatelogOffer();
    // this.gpuQuotasGobal = []
    this.calculate(null)
  }

  initSnapshot() {
    this.activeSnapshot = true;
    this.trashSnapshot = true;
    // this.calculate(null)
  }

  deleteSnapshot() {
    this.activeSnapshot = false;
    this.trashSnapshot = false;
    this.numberSnapshothdd = 0;
    this.calculate(null)
  }

  openIpSubnet() {
    this.calculate(-1);
  }

  changeTab(event: any) {
    this.refreshQuota()
    this.totalAmount = 0;
    this.totalPayment = 0;
    this.selectIndexTab = event.index;
    this.calculate(null);
    this.isShowAlertGpu = true;
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
              // this.siteToSiteId = this.listSiteToSite[1].id
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
              console.log("listLoadbalancer ff", this.listLoadbalancer)
              // this.loadBalancerId = this.listLoadbalancer[0].id
            });
        }
      );
  }



  private getPriceEachComponent(data: any) {
    console.log(data.orderItemPrices);
    // let fileStorage = 0;
    for (let item of data.orderItemPrices[0]?.details) {
      if (item.typeName == 'ippublic') {
        this.price.IpPublic = item.totalAmount.amount;
        this.price.IpPublicUnit = item.unitPrice.amount;

      } else if (item.typeName == 'ipfloating') {
        this.price.IpFloating = item.totalAmount.amount;
        this.price.IpFloatingUnit = item.unitPrice.amount;
      } else if (item.typeName == 'ipv6') {
        this.price.IpV6 = item.totalAmount.amount;
        this.price.IpV6Unit = item.unitPrice.amount;

      } else if (item.typeName == 'backup') {
        this.price.backup = item.totalAmount.amount;
        this.price.backupUnit = item.unitPrice.amount;
      } else if (item.typeName == 'filestorage') {
        this.price.fileStorage = item.totalAmount.amount;

        this.price.fileStorageUnit = item.unitPrice.amount;
        console.log("fileStorageUnit", this.price.fileStorageUnit)

      } else if (item.typeName == 'filestorage-snapshot') {
        this.price.filestorageSnapshot = item.totalAmount.amount;
        this.price.filestorageSnapshotUnit = item.unitPrice.amount;

      } else if (item.typeName == 'loadbalancer') {
        this.price.loadBalancer = item.totalAmount.amount;
        this.price.loadBalancerUnit = item.unitPrice.amount;

      } else if (item.typeName == 'vpn-site-to-site') {
        this.price.siteToSite = item.totalAmount.amount;
        this.price.siteToSiteUnit = item.unitPrice.amount;

      } else if (item.typeName == 'vcpu') {

        this.price.vcpu = item.totalAmount.amount;
        this.price.vcpuPerUnit = item.unitPrice.amount;
        console.log("vcpu", this.price.vcpu)
      } else if (item.typeName == 'ram') {
        this.price.ram = item.totalAmount.amount;
        this.price.ramPerUnit = item.unitPrice.amount;
      } else if (item.typeName == 'ssd') {
        this.price.ssd = item.totalAmount.amount;
        this.price.ssdPerUnit = item.unitPrice.amount;
      } else if (item.typeName == 'hdd') {
        this.price.hhd = item.totalAmount.amount;
        this.price.hhdPerUnit = item.unitPrice.amount;
      }
      else if (item.typeName == 'NVIDIA-A30') {
        console.log("huyen")
        console.log("this.gpuQuotasGobal555", this.gpuQuotasGobal)
        for (let gpu of this.gpuQuotasGobal) {
          if (gpu.GpuType == 'NVIDIA-A30') {
            gpu.GpuPrice = item.totalAmount.amount;
            console.log("gpu.GpuPrice", gpu.GpuPrice)
            gpu.GpuPriceUnit = item.unitPrice.amount;
            console.log("gpu.GpuPriceUnit", gpu.GpuPriceUnit)
          }
        }

      }
      else if (item.typeName == 'NVIDIA-A100') {
        for (let gpu of this.gpuQuotasGobal) {
          if (gpu.GpuType == 'NVIDIA-A100') {
            gpu.GpuPrice = item.totalAmount.amount;
            console.log("gpu.GpuPrice 2", gpu.GpuPrice)
            gpu.GpuPriceUnit = item.unitPrice.amount;
            console.log("gpu.GpuPriceUnit 2", gpu.GpuPriceUnit)
          }
        }
      }
      else if (item.typeName == 'snapshot-hdd') {
        this.price.snapshothdd = item.totalAmount.amount;
        this.price.snapshothddUnit = item.unitPrice.amount;
      }
      else if (item.typeName == 'snapshot-ssd') {
        this.price.snapshotssd = item.totalAmount.amount;
        this.price.snapshotssdUnit = item.unitPrice.amount;
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
    this.price.snapshothdd = 0;
    this.price.snapshothddUnit = 0;
    this.price.snapshotssd = 0;
    this.price.snapshotssdUnit = 0;
  }

  //

  findNameLoadBalance(loadBalancerId: number) {
    if (loadBalancerId) {
      const selectedLoadBalancer = this.listLoadbalancer.find(lb => lb.id === loadBalancerId)
      this.loadBalancerName = selectedLoadBalancer ? selectedLoadBalancer.offerName : null;
    } else {
      this.loadBalancerName = null;
    }
    this.calculate(null);
  }

  findNameSiteToSite(siteToSiteId: number) {
    if (siteToSiteId) {
      const selectedSiteToSite = this.listSiteToSite.find(lb => lb.id === siteToSiteId)
      this.sitetositeName = selectedSiteToSite ? selectedSiteToSite.offerName : null;

    } else {
      this.sitetositeName = null;
    }
    this.calculate(null);
  }

  getCatelogOffer() {
    this.instancesService.getTypeCatelogOffers(this.regionId, 'vm-gpu').subscribe(
      res => {
        this.listTypeCatelogOffer = res
        console.log("listTypeCatelogOffer", res)
        this.gpuQuotasGobal = this.listTypeCatelogOffer.map((item: any) => (

          {

            GpuOfferId: item.id,
            GpuCount: 0,
            GpuType: item.offerName,
            GpuPrice: null,
            GpuPriceUnit: item.price?.fixedPrice?.amount
          }));
        console.log("this.gpuQuotasGobal", this.gpuQuotasGobal)
      }
    );
  }
  trackById(index: number, item: any): any {
    return item.offerName;
  }
  maxNumber: number[] = [8, 8]


  getValues(index: number, value: number): void {

    console.log("index", index)
    console.log("value", value)
    console.log("gpuQuotasGobal 123", this.gpuQuotasGobal)
    if ((this.selectIndexTab == 0 && this.keySSD == false || (this.selectIndexTab == 0 && !this.offerFlavor)) || (this.selectIndexTab == 1 && this.ssd == 0) && this.gpuQuotasGobal[index].GpuCount != 0) {
      this.isShowAlertGpu = true
      console.log("isShowAlertGpu iuf", this.isShowAlertGpu)
    }
    else {
      this.isShowAlertGpu = false
      console.log("isShowAlertGpu else", this.isShowAlertGpu)
    }
    this.calculate(null)


  }


  refreshQuota() {
    this.vCPU = 0;
    this.ram = 0;
    this.hhd = 0;
    this.ssd = 0;
    this.offerFlavor = null;
    this.selectedElementFlavor = ''
    // this.ofer
  }

  checkRequired() {
    if (this.hhd != 0 || this.ssd) {
      this.isRequired = false;
    }
    else {
      this.isRequired = true;
    }
  }
  checkFlavor() {
    this.keySSD = this.offerFlavor.characteristicValues.find((charName) => charName.charName === 'VolumeType').charOptionValues?.[0] == 'SSD'
    console.log("keySSD", this.keySSD)
    if (this.keySSD) {
      this.isShowAlertGpu = false
    }
    else {
      this.isShowAlertGpu = true
    }

  }


  // getProductActivebyregion(catalog:string, regionid:number){
  //   this.vpc.getProductActivebyregion(catalog, regionid).subscribe((res: any) => {
  //     this.productByRegion = res
  //     this.catalogStatus[catalog] = this.productByRegion.some(product => product.isActive === true);

  //   })
  // }
  getProductActivebyregion() {
    const catalogs = ['ip', 'ipv6', 'volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-volume', 'loadbalancer-sdn', 'file-storage', 'file-storage-snapshot', 'vpns2s', 'vm-gpu']
    this.catalogService.getActiveServiceByRegion(catalogs, this.regionId).subscribe(data => {
      this.serviceActiveByRegion = data;
      this.serviceActiveByRegion.forEach((item: any) => {
        if (['ip'].includes(item.productName)) {
          this.typeIp = item.isActive;
        }
        if (['ipv6'].includes(item.productName)) {
          this.typeIpv6 = item.isActive;
        }
        if (['volume-snapshot-hdd'].includes(item.productName)) {
          this.typeVolume_snapshot_hdd = item.isActive;
        }
        if (['volume-snapshot-ssd'].includes(item.productName)) {
          this.typeVolume_snapshot_ssd = item.isActive;
        }
        if (['backup-volume'].includes(item.productName)) {
          this.typeBackup_volume = item.isActive;
          console.log("typeBackup_volume", this.typeBackup_volume);
        }
        if (['loadbalancer-sdn'].includes(item.productName)) {
          this.typeLoadbalancer_sdn = item.isActive;
        }
        if (['file-storage'].includes(item.productName)) {
          this.typeFile_storage = item.isActive;
        }
        if (['file-storage-snapshot'].includes(item.productName)) {
          this.typeFile_storage_snapshot = item.isActive;
        }
        if (['vpns2s'].includes(item.productName)) {
          this.typeVpns2s = item.isActive;
        }
        if (['vm-gpu'].includes(item.productName)) {
          this.typeVm_gpu = item.isActive;
        }
      });
    });
  }
}
