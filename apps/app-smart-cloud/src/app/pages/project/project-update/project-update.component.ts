import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { NguCarouselConfig } from "@ngu/carousel";
import { OfferItem } from "../../instances/instances.model";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { InstancesService } from "../../instances/instances.service";
import { ActivatedRoute, Router } from "@angular/router";
import { IpPublicService } from "../../../shared/services/ip-public.service";
import { getCurrentRegionAndProject } from "@shared";
import { finalize } from "rxjs/operators";
import { RegionModel, slider } from "../../../../../../../libs/common-utils/src";
import { VpcModel } from "../../../shared/models/vpc.model";
import { VpcService } from "../../../shared/services/vpc.service";
import { OfferDetail, SupportService } from '../../../shared/models/catalog.model';
import { debounceTime, Subject } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { OrderService } from 'src/app/shared/services/order.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { CatalogService } from 'src/app/shared/services/catalog.service';

@Component({
  selector: 'one-portal-project-update',
  templateUrl: './project-update.component.html',
  styleUrls: ['./project-update.component.less'],
  animations: [slider],
})
export class ProjectUpdateComponent implements OnInit {
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 2, lg: 3, all: 0 },
    speed: 250,
    point: {
      visible: true,
    },
    touch: true,
    loop: true,
    // interval: { timing: 1500 },
    animation: 'lazy',
  };
  listIpType = [
    { label: "IP Public", value: "0" },
    { label: "Ip Floating", value: "1" },
    { label: "IpV6", value: "2" },
  ];


  listOfferFlavors: OfferItem[] = [];
  offerFlavor: OfferItem;
  selectedElementFlavor: any;

  data: VpcModel;
  regionId: any;
  loadingCalculate = false;
  dateNow: any;
  today: any;
  expiredDate: any;

  numberNetwork: number = 0;
  numberRouter: number = 0;
  numberSecurityGroup: number = 0;

  vCPU = 0;
  ram = 0;
  // hhd = 0;
  // ssd = 0;

  ipConnectInternet = '';
  ipNetworkAddress: string = '';
  ipNetworkId: string = '';
  numberIpFloating: number = 0;
  numberIpPublic: number = 0;
  numberIpv6: number = 0;

  numberSnapshothdd: number = 0;
  numberSnapshotssd: number = 0;

  numberBackup: number = 0;

  numberLoadBalancer: number = 0;
  loadBalancerId: number;
  loadBalancerName: string;

  numberFileSystem: number = 0;
  numberFileScnapsshot: number = 0;


  siteToSiteId: number;
  sitetositeName: string;

  gpuQuotasGobal: { GpuOfferId: number, GpuCount: number, GpuType: string, GpuPrice: number, GpuPriceUnit: number }[] = [];
  maxTotal: number = 8;


  activeIP = false;
  trashIP = false;

  activeBackup = false;
  trashBackup = false;

  activeLoadBalancer = false;
  trashLoadBalancer = false;

  activeFileStorage = false;
  trashFileStorage = false;

  activeSiteToSite = false;
  trashVpnSiteToSite = false;

  activeVpnGpu = false;
  trashVpnGpu = false;

  activeSnapshot = false;
  trashSnapshot = false;

  offerIdOld: number = 0;
  vCPUOld = 0;
  ramOld = 0;
  hhdOld = 0;
  ssdOld = 0;
  ipv6Old: number = 0;
  ipPublicOld: number = 0;

  ipPublicTotal: number = 0;
  ipPublicAddOld: number = 0;
  ipPublicOffer: number = 0;

  ipNetworkAddressOld: string = '';

  ipFloatingOld: number = 0;
  backupOld: number = 0;
  snapshothddOld: number = 0;
  snapshotssdOld: number = 0;

  loadBalancerOld: number = 0;


  fileSnapshotOld: number = 0;
  fileSystemOld: number = 0;
  vpnsitetositeIdOld: number = 0;
  vpnsitetositeNameOld: string = '';
  loadbalancerOfferNameOld: string = '';
  gpuOld: any;
  keySSDOld: boolean = false;

  ipOld: string = '';
  ipNameOld: string = '';



  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;
  selectPackge = '';
  listLoadbalancer: OfferDetail[] = [];
  listSiteToSite: OfferDetail[] = [];
  listIpConnectInternet: any[];
  private searchSubject = new Subject<string>();
  selectIndexTab: number = 0;
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
    snapshothdd: 0,
    snapshothddUnit: 0,
    snapshotssd: 0,
    snapshotssdUnit: 0,

    loadBalancer: 0,
    loadBalancerUnit: 0,
    fileStorage: 0,
    fileStorageUnit: 0,
    filestorageSnapshot: 0,
    filestorageSnapshotUnit: 0,
    siteToSite: 0,
    siteToSiteUnit: 0
  };
  newgpu: any
  checkPackage: boolean = true;
  activeBonusService = true;
  iconToggle: string;

  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;


  listTypeCatelogOffer: any;
  disableIpConnectInternet: boolean = true;
  loadingIpConnectInternet: boolean = true;

  isLoading = false;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];

  hasRoleSI: boolean
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  serviceActiveByRegion: SupportService[] = [];
  typeHdd:boolean;
  typeSsd:boolean;
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
  isChangegpu: boolean = false;

  isShowAlertGpu: boolean;
  keySSD: boolean;
  loadBalancerPrice!: any;
  loadBalancerLowerPrices!: any;
  sitetositePrice!: any;
  listSiteToSitePrice!: any;
  valueVolumeType!: any;

  form = new FormGroup({
    name: new FormControl({ value: 'loading data....', disabled: false }, { validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/),] }),
    description: new FormControl({ value: 'loading data....', disabled: false }),
    numOfMonth: new FormControl({ value: 1, disabled: true }, { validators: [Validators.required] }),
    //tab 1
    //tab 2
    // vCPU: new FormControl(1, {validators: this.selectIndexTab === 1 ? [Validators.required] : []}),
    // ram: new FormControl(1, {validators: this.selectIndexTab === 1 ? [Validators.required] : []}),
    // hhd: new FormControl(0),
    // ssd: new FormControl(0),
  });
  private readonly debounceTimeMs = 500;
  private inputChangeSubject = new Subject<{ value: number, name: string }>();
  private inputChangeMax = new Subject<{ value: number, max: number, name: string }>();
  private inputGPUMax = new Subject<{ index: number, max: number, value: number }>();
  disisable = true;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ipService: IpPublicService,
    private activatedRoute: ActivatedRoute,
    private vpc: VpcService,
    private notification: NzNotificationService,
    private orderService: OrderService,
    private catalogService: CatalogService
  ) {
    // this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((search: any) => {
    //   this.calculateReal();
    // });
    this.inputChangeSubject.pipe(
      debounceTime(500)
    ).subscribe(data => this.checkNumberInput(data.value, data.name));
    this.inputChangeMax.pipe(debounceTime(800)).subscribe(data => this.checkNumberInputNoBlock(data.value, data.max, data.name));
    this.inputGPUMax.pipe(debounceTime(800)).subscribe(data => this.getValues(data.index, data.max, data.value));
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.loadData();
    this.iconToggle = "icon_circle_minus";
    this.getStepBlock('BLOCKSTORAGE');
    // this.calculateReal();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.calculateReal();
    });
    this.dateNow = new Date();
    this.calculate()

    this.getProductActivebyregion();

    this.getCatelogOffer()
    this.hasRoleSI = localStorage.getItem('role').includes('SI')


  }
  openIpSubnet() {
    this.calculate()
  }
  private calculateReal() {

    this.refreshValue();

    if (((this.offerIdOld == 0 && this.ssdOld == 0 && this.ssd == 0) || (this.offerIdOld != 0 && this.ssdOld == 0 && this.ssd == 0 && this.keySSDOld == false))) {
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

    // let IPFloating = this.ipNetworkAddress !=null ? this.numberIpFloating + this.ipFloatingOld : this.ipFloatingOld;
    // this.numberIpFloating = this.ipConnectInternet != '' ? this.numberIpFloating : 0
    this.numberIpFloating = this.ipConnectInternet ? this.numberIpFloating : 0



    if ((this.selectIndexTab == 0 || this.offerFlavor != undefined) || (this.selectIndexTab == 1 || (this.vCPU != 0 && this.ram != 0))) {
      this.loadingCalculate = true;
      if (lstIp != null && lstIp != undefined) {
        ipName = lstIp[1];
      }
      const requestBody =
      {

        newQuotavCpu: this.vCPU + this.vCPUOld,
        newQuotaRamInGb: this.ram + this.ramOld,
        newQuotaHddInGb: this.hhd + this.hhdOld,
        newQuotaSsdInGb: this.ssd + this.ssdOld,

        newPublicNetworkId: this.ipConnectInternet ? (ip ? ip : '') : this.ipOld,
        // newPublicNetworkAddress: this.ipConnectInternet ? ((ipName != '' && ipName != undefined) ? ipName : '') : this.ipNameOld,
        newPublicNetworkAddress: this.ipConnectInternet ? (ipName  ? ipName : '') : this.ipNameOld,
        newQuotaIpPublicCount: this.data?.offerDetail ? (this.numberIpPublic + this.ipPublicAddOld) : (this.numberIpPublic + this.ipPublicTotal),


        newQuotaIpFloatingCount: this.numberIpFloating + this.ipFloatingOld,
        newQuotaIpv6Count: this.numberIpv6 + this.ipv6Old,

        newQuotaVolumeSnapshotHddInGb: this.numberSnapshothdd + this.snapshothddOld,
        newQuotaVolumeSnapshotSsdInGb: this.numberSnapshotssd + this.snapshotssdOld,

        newQuotaBackupVolumeInGb: this.numberBackup + this.backupOld,

        newLoadBalancerOfferId: this.loadBalancerId,
        newQuotaLoadBalancerSdnCount: this.numberLoadBalancer + this.loadBalancerOld,


        newQuotaShareInGb: this.numberFileSystem + this.fileSystemOld,
        newQuotaShareSnapshotInGb: this.numberFileScnapsshot + this.fileSnapshotOld,

        newVpnSiteToSiteOfferId: this.siteToSiteId,

        // NewGpuQuotas: this.data?.gpuProjects ? this.gpuQuotasGobal : this.newgpu,
        gpuQuotas: this.isChangegpu ? this.newgpu : this.gpuOld,



        newQuotaSecurityGroupCount: this.numberSecurityGroup,
        newQuotaNetworkCount: this.numberNetwork,
        newQuotaRouterCount: this.numberRouter,


        typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
        serviceType: 12,
        serviceInstanceId: this.data?.id,
        customerId: this.tokenService.get()?.userId,
        newOfferId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? 0 : this.offerFlavor.id) : 0,
        // newOfferId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? this.data?.offerId : this.offerFlavor.id) : 0,
        actionType: 4,
        regionId: this.regionId,
        serviceName: this.form.controls['name'].value
      }
      const request = {
        orderItems: [
          {
            orderItemQuantity: 1,
            specificationString: JSON.stringify(requestBody),
            specificationType: "vpc_resize",
            sortItem: 0,
          }
        ]
      }
      this.ipService.getTotalAmount(request)
        .pipe(finalize(() => {
          this.loadingCalculate = false
          this.disisable = false;
        }))
        .subscribe(
          data => {
            this.total = data;
            this.totalAmount = this.total.data.totalAmount.amount;
            this.totalPayment = this.total.data.totalPayment.amount;
            this.totalVAT = this.total.data.totalVAT.amount;
            this.getPriceEachComponent(data.data);
          }
        );
    } else {
      this.total = undefined;
    }
  }

  calculate() {
    this.searchSubject.next('');
  }

  onChangeConfigCustom() {

  }

  onInputFlavors(event: any, offerName: any) {
    this.selectPackge = offerName;
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === event
    );
    this.selectedElementFlavor = 'flavor_' + event;
    this.checkFlavor()
    this.calculate();
  }
  // checkOfferById:OfferItem
  offerType: string
  listOfferByTypeName: OfferItem[] = [];
  initFlavors(): void {
    this.instancesService.getDetailProductByUniqueName('vpcOnePortal')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductId('155', this.regionId)
            .pipe(finalize(() => {
              this.offerFlavor = this.listOfferFlavors.find(
                (flavor) => flavor.id === this.data.offerId
              );
              this.selectedElementFlavor = 'flavor_' + this.data.offerId;
            }))
            .subscribe((data: any) => {
              this.listOfferFlavors = data.filter(
                (e: OfferItem) =>
                  e.status.toUpperCase() == 'ACTIVE'
              );
              const checkOfferById = this.listOfferFlavors.find((offer: OfferItem) =>
                offer.id === this.data?.offerId
              )
              this.keySSDOld = checkOfferById?.characteristicValues.find((charName) => charName.charName === 'VolumeType').charOptionValues?.[0] == 'SSD'
              const charName = checkOfferById?.characteristicValues.find((typeName) => typeName.charName === 'VolumeType')
              const typeName = charName?.charOptionValues?.[0]
              this.listOfferByTypeName = this.listOfferFlavors.filter((e: OfferItem) =>
                e.characteristicValues.find((charName) => charName.charName === 'VolumeType')?.charOptionValues?.[0] == typeName

              )

              this.checkFlavor()

              this.listOfferFlavors.forEach((e: OfferItem) => {
                e.description = '0 vCPU / 0 GB RAM / 0 GB HDD / 0 IP';
                e.characteristicValues.forEach((ch) => {
                  // if (ch.charName.toUpperCase() == 'CPU') {
                  //   e.description.replace(ch.charOptionValues[0] + " CPU", " vCPU");
                  // }
                  if (ch.charName == 'CPU') {
                    e.description = e.description.replace(/0 vCPU/g, ch.charOptionValues[0] + " vCPU");
                  }
                  if (ch.charName == 'RAM') {
                    e.description = e.description.replace(/0 GB RAM/g, ch.charOptionValues[0] + " GB RAM");
                  }

                  // if (ch.charName == 'HHD') {
                  //   e.description = e.description.replace(/0 GB HHD/g, ch.charOptionValues[0] + " GB HHD");
                  // }

                  if (ch.charName == 'Storage') {
                    this.valueVolumeType = ch.charOptionValues[0]
                  }

                  if (ch.charName == 'VolumeType' && ch.charOptionValues[0] == 'HDD') {
                    e.description = e.description.replace(/0 GB HDD/g, this.valueVolumeType + " GB HDD");
                  }
                  if (ch.charName == 'VolumeType' && ch.charOptionValues[0] == 'SSD') {
                    e.description = e.description.replace(/0 GB HDD/g, this.valueVolumeType + " GB SSD");
                  }

                  if (ch.charName == 'IP') {
                    e.description = e.description.replace(/0 IP/g, ch.charOptionValues[0] + " IP");
                    e.ipNumber = ch.charOptionValues[0];
                  }
                });
    
              });
              this.cdr.detectChanges();
            });
        })
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.router.navigate(['/app-smart-cloud/project'])
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onChangeTime() {
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() + Number(this.form.controls['numOfMonth'].value));
    this.expiredDate = dateNow;
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/project'])
  }


  updateVpc() {
    let lstIp = this.ipConnectInternet?.split('--');
    let ip = '';
    let ipName = '';
    if (lstIp != null && lstIp != undefined) {
      ip = lstIp[0];
    }

    // let IPFloating = this.ipNetworkAddress !=null ? this.numberIpFloating + this.ipFloatingOld : this.ipFloatingOld;
    // this.numberIpFloating = this.ipConnectInternet != '' ? this.numberIpFloating : 0
    this.numberIpFloating = this.ipConnectInternet  ? this.numberIpFloating : 0


    if ((this.selectIndexTab == 0 || this.offerFlavor != undefined) || (this.selectIndexTab == 1 || (this.vCPU != 0 && this.ram != 0))) {
      this.loadingCalculate = true;
      if (lstIp != null && lstIp != undefined) {
        ipName = lstIp[1];
      }
      const requestBody =
      {
        newQuotavCpu: this.vCPU + this.vCPUOld,
        newQuotaRamInGb: this.ram + this.ramOld,
        newQuotaHddInGb: this.hhd + this.hhdOld,
        newQuotaSsdInGb: this.ssd + this.ssdOld,

        newPublicNetworkId: this.ipConnectInternet ? (ip ? ip : '') : this.ipOld,
        // newPublicNetworkAddress: this.ipConnectInternet ? ((ipName != '' && ipName != undefined) ? ipName : '') : this.ipNameOld,
        newPublicNetworkAddress: this.ipConnectInternet ? (ipName  ? ipName : '') : this.ipNameOld,
        newQuotaIpPublicCount: this.data?.offerDetail ? (this.numberIpPublic + this.ipPublicAddOld) : (this.numberIpPublic + this.ipPublicTotal),
        newQuotaIpFloatingCount: this.numberIpFloating + this.ipFloatingOld,
        newQuotaIpv6Count: this.numberIpv6 + this.ipv6Old,

        newQuotaVolumeSnapshotHddInGb: this.numberSnapshothdd + this.snapshothddOld,
        newQuotaVolumeSnapshotSsdInGb: this.numberSnapshotssd + this.snapshotssdOld,

        newQuotaBackupVolumeInGb: this.numberBackup + this.backupOld,

        newQuotaLoadBalancerSdnCount: this.numberLoadBalancer + this.loadBalancerOld,
        newLoadBalancerOfferId: this.loadBalancerId,

        newQuotaShareInGb: this.numberFileSystem + this.fileSystemOld,
        newQuotaShareSnapshotInGb: this.numberFileScnapsshot + this.fileSnapshotOld,

        newVpnSiteToSiteOfferId: this.siteToSiteId,

        gpuQuotas: this.isChangegpu ? this.newgpu : this.gpuOld,

        // gpuQuotas: this.newgpu  ?this.newgpu : this.gpuOld,
        // gpuQuotas: (this.gpuQuotasGobal && this.gpuQuotasGobal.length > 0) ?this.newgpu : this.gpuOld,

        newQuotaSecurityGroupCount: this.numberSecurityGroup,
        newQuotaNetworkCount: this.numberNetwork,
        newQuotaRouterCount: this.numberRouter,

        typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
        serviceType: 1,
        serviceInstanceId: this.data.id,
        customerId: this.tokenService.get()?.userId,
        newOfferId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? 0 : this.offerFlavor.id) : 0,
        // newOfferId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? this.data.offerId : this.offerFlavor.id) : 0,
        actionType: 12,
        regionId: this.regionId,
        serviceName: this.form.controls['name'].value
      }

      const request = {
        customerId: this.tokenService.get()?.userId,
        createdByUserId: this.tokenService.get()?.userId,
        note: "Cập nhật VPC",
        totalPayment: this.total.data.totalPayment.amount,
        totalVAT: this.total.data.totalVAT.amount,
        orderItems: [
          {
            orderItemQuantity: 1,
            specification: JSON.stringify(requestBody),
            specificationType: "vpc_resize",
            serviceDuration: this.form.controls['numOfMonth'].value,
            price: this.total.data.totalAmount.amount,
          }
        ]
      }

      this.orderService
        .validaterOrder(request)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (result) => {
            if (result.success) {
              if (this.hasRoleSI) {
                this.vpc.createIpPublic(request).subscribe(
                  data => {
                    this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('project.action.resize'));
                    this.router.navigate(['/app-smart-cloud/project']);
                  },
                  error => {
                    this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('project.note53'));
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

      // var returnPath: string = window.location.pathname;
      // this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
    }
  }
  // openIpSubnet() {
  //   this.calculate();
  // }

  changeTab(event: any) {
    this.selectIndexTab = event.index;
  }

  loadListIpConnectInternet() {
    this.loadingIpConnectInternet = true;
    this.disableIpConnectInternet = true;
    this.instancesService.getAllIPSubnet(this.regionId).pipe(finalize(() => {
      this.disableIpConnectInternet = false;
      this.loadingIpConnectInternet = false;
    }))
      .subscribe(
        data => {
          this.listIpConnectInternet = data
        }
      )
  }


  // getDetailTest
  private loadData() {

    this.vpc.getDetail(this.activatedRoute.snapshot.paramMap.get('id'))
      .pipe(finalize(() => {
        this.loadListIpConnectInternet();
        this.initLoadBalancerData();
        this.initVpnSiteToSiteData();
        this.initFlavors();
      }))
      .subscribe(
        data => {
          this.data = data;
          console.log("data vpc detail", this.data)
          this.checkConfigPackage(this.data?.offerId)

          // this.price.vcpu =
          this.form.controls['name'].setValue(data.displayName);
          this.form.controls['description'].setValue(data.description);
          this.today = this.data.createDate;
          this.expiredDate = this.data.expireDate;
          this.vCPUOld = data.quotavCpu;
          this.ramOld = data.quotaRamInGb;
          this.hhdOld = data.quotaHddInGb;
          this.ssdOld = data.quotaSSDInGb;
          this.ipConnectInternet = (data.publicNetworkId && data.publicNetworkAddress) ? data.publicNetworkId + '--' + data.publicNetworkAddress : '';
          this.ipOld = data.publicNetworkId;
          this.ipNameOld = data.publicNetworkAddress;
          this.ipv6Old = data.quotaIpv6Count;
          this.ipFloatingOld = data.quotaIpFloatingCount;
          this.backupOld = data.quotaBackupVolumeInGb;
          this.loadBalancerOld = data.quotaLoadBalancerSDNCount;
          this.fileSystemOld = data.quotaShareInGb;
          this.fileSnapshotOld = data.quotaShareSnapshotInGb;

          this.siteToSiteId = data.vpnSiteToSiteOfferId;
          this.vpnsitetositeNameOld = data.vpnSiteToSiteOfferName;

          this.loadbalancerOfferNameOld = data.loadbalancerOfferName;
          this.loadBalancerId = data?.offerIdLBSDN;

          this.gpuOld = data.gpuProjects;
          this.snapshothddOld = data.quotaVolumeSnapshotHddInGb;
          this.snapshotssdOld = data.quotaVolumeSnapshotSsdInGb;

          this.numberNetwork = data.quotaNetworkCount;
          this.numberRouter = data.quotaRouterCount;
          this.numberSecurityGroup = data.quotaSecurityGroupCount;

          this.ipPublicOffer = this.data.offerDetail ? (data.offerDetail?.ipPublic) : 0;
          this.ipPublicTotal = data.quotaIpPublicCount;
          this.ipPublicAddOld = this.data.offerDetail ? (this.ipPublicTotal - this.ipPublicOffer) : this.ipPublicTotal;
          // this.ipPublicAddOld
          this.offerIdOld = data.offerId



        }, error => {

          if (error.status === 500) {
            this.router.navigate(['/app-smart-cloud/project']);
            this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi(error.error.message));
          }

        }
      )
    this.calculate();
  }

  checkPossiblePress(event: KeyboardEvent) {
    const key = event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      event.preventDefault();
    }
  }

  private initLoadBalancerData() {
    this.instancesService.getDetailProductByUniqueName('loadbalancer-sdn')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductId(data[0].id, this.regionId)
            .subscribe((data: any) => {

              if (this.data?.offerIdLBSDN) {
                const loadBalancerIdOld = data.find(lb => lb.id === this.data?.offerIdLBSDN)
                this.loadBalancerPrice = loadBalancerIdOld?.price?.fixedPrice?.amount
                this.listLoadbalancer = data.filter(item => item.price.fixedPrice.amount >= this.loadBalancerPrice)
                this.loadBalancerId = this.data?.offerIdLBSDN;
                this.findNameLoadBalance(this.loadBalancerId);
              }
              else {
                this.listLoadbalancer = data;
                // this.loadBalancerId = this.listLoadbalancer[0].id;
                this.loadBalancerId = this.data?.offerIdLBSDN
                this.findNameLoadBalance(this.loadBalancerId);
              }
            });
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
              // this.listSiteToSite = data;
              // this.findSiteToSitePriceId()
              if (this.data?.vpnSiteToSiteOfferId) {
                const sitetositeIdOld = data.find(vpn => vpn.id === this.data?.vpnSiteToSiteOfferId)
                this.sitetositePrice = sitetositeIdOld?.price?.fixedPrice?.amount
                this.listSiteToSite = data.filter(item => item.price.fixedPrice.amount >= this.sitetositePrice)
                this.siteToSiteId = this.data?.vpnSiteToSiteOfferId;
                this.findNameSiteToSite(this.siteToSiteId);
              }
              else {
                this.listSiteToSite = data;
                // this.siteToSiteId = this.listSiteToSite[0].id;
                this.siteToSiteId = this.data?.vpnSiteToSiteOfferId
                this.findNameSiteToSite(this.siteToSiteId);
              }
            });
        }
      );
  }

  private getPriceEachComponent(data: any) {
    // let fileStorage = 0
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
        for (let gpu of this.gpuQuotasGobal) {
          if (gpu.GpuType == 'NVIDIA-A30') {
            gpu.GpuPrice = item.totalAmount.amount;

            gpu.GpuPriceUnit = item.unitPrice.amount;

          }
        }

      }
      else if (item.typeName == 'NVIDIA-A100') {
        for (let gpu of this.gpuQuotasGobal) {
          if (gpu.GpuType == 'NVIDIA-A100') {
            gpu.GpuPrice = item.totalAmount.amount;

            gpu.GpuPriceUnit = item.unitPrice.amount;

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

  activeEdit() {
    this.disisable = false;
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


  checkConfigPackage(offerId: number) {
    if (offerId != 0) {
      this.selectIndexTab = 0
      this.checkPackage = true
    }
    else {
      this.selectIndexTab = 1
      this.checkPackage = false
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
  getStepBlock(name: string) {
    this.ipService.getStepBlock(name).subscribe((res: any) => {
      const valuestring: any = res.valueString;
      const parts = valuestring.split("#")
      this.minBlock = parseInt(parts[0]);
      this.stepBlock = parseInt(parts[1]);
      this.maxBlock = parseInt(parts[2]);
    })
  }

  onInputChange(value: number, name: string): void {
    this.inputChangeSubject.next({ value, name });
  }
  onInputMax(value: number, max: number, name: string): void {
    this.inputChangeMax.next({ value, max, name });
  }
  gpuMax(index: number, max: number, value: number) {
    this.inputGPUMax.next({ index, max, value })
  }
  _hhd: number = this.maxBlock;

  get hhd(): number {
    return this._hhd;
  }

  set hhd(value: number) {
    this._hhd = Math.min(Math.max(value, this.minBlock), this.maxBlock);
  }

  _ssd: number = this.maxBlock;

  get ssd(): number {
    return this._ssd;
  }

  set ssd(value: number) {
    this._ssd = Math.min(Math.max(value, this.minBlock), this.maxBlock);
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
    this.calculate();
  }

  checkNumberInputNoBlock(value: number, max: number, name: string): void {
    const numericValue = Number(value);
    const messageStepNotification = `Vượt quá số lượng max  ${max} `;
    if (isNaN(numericValue)) {
      this.notification.warning('', "Giá trị không hợp lệ");
      return;
    }
    let number;
    if (numericValue > max) {
      this.notification.warning('', messageStepNotification);
      number = max;
    }
    else {
      number = numericValue
    }
    switch (name) {
      case "ippublic":
        this.numberIpPublic = number;
        break;
      case "ipfloating":
        this.numberIpFloating = number;
        break;
      case "ipv6":
        this.numberIpv6 = number;
        break;
      case "ram":
        this.ram = number;
        break;
      case "vcpu":
        this.vCPU = number;
        break;
      case "loadbalancer":
        this.numberLoadBalancer = number;
        break;
    }
    this.calculate();
  }
  findPriceLowerId() {}

  findNameLoadBalance(loadBalancerId: number) {
    if (loadBalancerId) {
      const selectedLoadBalancer = this.listLoadbalancer.find(lb => lb.id === loadBalancerId)
      this.loadBalancerName = selectedLoadBalancer ? selectedLoadBalancer.offerName : null;

    } else {
      this.loadBalancerName = null;

    }
    this.calculate();
  }

  findNameSiteToSite(siteToSiteId: number) {
    if (siteToSiteId) {
      const selectedSiteToSite = this.listSiteToSite.find(lb => lb.id === siteToSiteId)
      this.sitetositeName = selectedSiteToSite ? selectedSiteToSite.offerName : null;

    } else {
      this.sitetositeName = null;
    }
    this.calculate();
  }
  findSiteToSitePriceId() {
    const sitetositeIdOld = this.listSiteToSite.find(lb => lb.id === this.data?.vpnSiteToSiteOfferId)
    this.sitetositePrice = sitetositeIdOld?.price?.fixedPrice?.amount
    this.listSiteToSitePrice = this.listSiteToSite.filter(item => item.price.fixedPrice.amount >= this.sitetositePrice)
  }
  getCatelogOffer() {

    this.instancesService.getTypeCatelogOffers(this.regionId, 'vm-gpu').subscribe(
      res => {
        this.listTypeCatelogOffer = res
        this.newgpu = this.gpuQuotasGobal = this.listTypeCatelogOffer.map((item: any) => ({
          GpuOfferId: item.id,
          GpuCount: 0,
          GpuType: item.offerName,
          GpuPrice: 0,
          GpuPriceUnit: item?.price?.fixedPrice?.amount
        }));
      }
    );
  }

  // maxNumber: number[] = [8, 8];
  getValues(index: number, max: number, value: number): void {
    const message = `Vượt quá số lượng max ${max}`
    if (value > max) {
      this.notification.warning('', message);
      this.gpuQuotasGobal[index].GpuCount = max;
    }
    else {
      this.gpuQuotasGobal[index].GpuCount = value;
    }

    if (((this.offerIdOld == 0 && this.ssdOld == 0 && this.ssd == 0) || (this.offerIdOld != 0 && this.ssdOld == 0 && this.ssd == 0 && this.keySSDOld == false)) && this.gpuQuotasGobal[index].GpuCount != 0) {
      this.isShowAlertGpu = true
    }
    else {
      this.isShowAlertGpu = false
    }
    if (value != 0) {
      this.getValueNewgpu();
    }

    this.calculate();

  }

  getValueNewgpu() {
    // this.isChangegpu = false;
    const dict2 = this.gpuQuotasGobal.reduce((acc, item) => {
      acc[item.GpuOfferId] = item;
      return acc;
    }, {});
    this.newgpu = this.gpuOld.map((item: any) => {
      const gpuOfferId = item.gpuOfferId;

      const array2Item = dict2[gpuOfferId];
      const totalCountGpu = item.gpuCount + (array2Item ? array2Item.GpuCount : 0);
      if (totalCountGpu != 0) this.isChangegpu = true;
      return {
        GpuOfferId: gpuOfferId,
        GpuType: item.gpuType,
        GpuCount: totalCountGpu,
      };
    });

  }
  getProductActivebyregion() {
    const catalogs = ['volume-hdd','volume-ssd','ip', 'ipv6', 'volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-volume', 'loadbalancer-sdn', 'file-storage', 'file-storage-snapshot', 'vpns2s', 'vm-gpu']
    this.catalogService.getActiveServiceByRegion(catalogs, this.regionId).subscribe(data => {
      this.serviceActiveByRegion = data;
      this.serviceActiveByRegion.forEach((item: any) => {
        if (['volume-hdd'].includes(item.productName)) {
          this.typeHdd = item.isActive;
        }
        if (['volume-ssd'].includes(item.productName)) {
          this.typeSsd = item.isActive;
        }
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

  trackById(index: number, item: any): any {
    return item.offerName;
  }
  checkFlavor() {
    this.keySSD = this.offerFlavor?.characteristicValues.find((charName) => charName.charName === 'VolumeType').charOptionValues?.[0] == 'SSD'
    if (this.keySSD) {
      this.isShowAlertGpu = false
    }
    else {
      this.isShowAlertGpu = true
    }

  }
  findLbLowerPrices() {}
  initIP() {
    this.activeIP = true;
    this.trashIP = true;
    this.loadListIpConnectInternet();
    this.calculate()
  }
  deleteIP() {
    this.activeIP = false;
    this.trashIP = false;
    this.numberIpPublic = 0;
    this.numberIpv6 = 0;
    this.numberIpFloating = 0;

    // if (this.data.publicNetworkAddress != '' && this.data.publicNetworkId != '') {
    //   this.ipConnectInternet = this.data.publicNetworkId + '--' + this.data.publicNetworkAddress;
    // }
    // else {
    //   this.ipConnectInternet = '';
    // }
    if (this.data.publicNetworkAddress  && this.data.publicNetworkId ) {
      this.ipConnectInternet = this.data.publicNetworkId + '--' + this.data.publicNetworkAddress;
    }
    else {
      this.ipConnectInternet = '';
    }
    this.calculate()
  }
  initBackup() {
    this.activeBackup = true;
    this.trashBackup = true;
    this.calculate()
  }
  deleteBackup() {
    this.activeBackup = false;
    this.trashBackup = false;
    this.numberBackup = 0;
    this.calculate()
  }

  initLoadBalancer() {
    this.activeLoadBalancer = true;
    this.trashLoadBalancer = true;
    if (this.data?.offerIdLBSDN) {
      this.loadBalancerId = this.data?.offerIdLBSDN;
      this.findNameLoadBalance(this.loadBalancerId);
    }
    else {
      this.loadBalancerId = this.listLoadbalancer[0].id;
      this.findNameLoadBalance(this.loadBalancerId);
    }
  }
  deleteLoadBalancer() {
    this.activeLoadBalancer = false;
    this.trashLoadBalancer = false
    this.numberLoadBalancer = 0;
    this.loadBalancerId = this.data?.offerIdLBSDN;
    this.calculate()
  }

  initFileStorage() {
    this.activeFileStorage = true;
    this.trashFileStorage = true;
  }
  deleteFileStorage() {
    this.activeFileStorage = false;
    this.trashFileStorage = false;
    this.numberFileSystem = 0;
    this.numberFileScnapsshot = 0;
    this.calculate()
  }
  initVpnSiteToSite() {
    this.activeSiteToSite = true;
    this.trashVpnSiteToSite = true;
    if (this.data?.vpnSiteToSiteOfferId) {
      this.siteToSiteId = this.data?.vpnSiteToSiteOfferId;
      this.sitetositeName = this.data?.vpnSiteToSiteOfferName;
    }
    else {
      this.siteToSiteId = this.listSiteToSite[0].id;
      this.findNameSiteToSite(this.siteToSiteId);
    }


  }
  deleteVpnSiteToSite() {
    this.activeSiteToSite = false;
    this.trashVpnSiteToSite = false;
    this.siteToSiteId = this.data?.vpnSiteToSiteOfferId;
    this.sitetositeName = this.data?.vpnSiteToSiteOfferName;
    this.calculate()
  }
  initVpnGpu() {
    this.activeVpnGpu = true;
    this.trashVpnGpu = true;


  }
  deleteVpnGpu() {
    this.activeVpnGpu = false;
    this.trashVpnGpu = false;
    this.getCatelogOffer();
    this.isChangegpu = false;
    this.calculate()
  }
  initSnapshot() {
    this.activeSnapshot = true;
    this.trashSnapshot = true;
  }

  deleteSnapshot() {
    this.activeSnapshot = false;
    this.trashSnapshot = false;
  }
}
