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
import { OfferDetail } from '../../../shared/models/catalog.model';
import { debounceTime, Subject } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
  today: any;
  expiredDate: any;
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

  activeVpnGpu= false;
  trashVpnGpu = false;

  vCPUOld = 0;
  ramOld = 0;
  hhdOld = 0;
  ssdOld = 0;
  vCPU = 1;
  ram = 1;
  hhd = 0;
  ssd = 0;
  ipConnectInternet = 'loading data....';
  loadBalancerId = '';
  siteToSiteId = '';

  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;
  selectPackge = '';
  listLoadbalancer: OfferDetail[] = [];
  listSiteToSite: OfferDetail[] = [];
  listIpConnectInternet: any[];
  private searchSubject = new Subject<string>();
  selectIndexTab: any = 0;
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
  checkPackage: boolean;
  activeBonusService = true;
  iconToggle: string;

  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;
  loadBalancerName:string;
  sitetositeName:string;
  listTypeCatelogOffer:any;

  numbergpu: number[] = [];


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
  disisable = true;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ipService: IpPublicService,
    private activatedRoute: ActivatedRoute,
    private service: VpcService,
    private notification: NzNotificationService) {
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((search: any) => {
      this.calculateReal();
    });
    this.inputChangeSubject.pipe(
      debounceTime(800)
    ).subscribe(data => this.checkNumberInput(data.value, data.name));
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.loadData();
    this.iconToggle = "icon_circle_minus";
    this.getStepBlock('BLOCKSTORAGE');
    this.getCatelogOffer()
   
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
    this.calculate();
  }

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
                (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
              );

              this.listOfferFlavors.forEach((e: OfferItem) => {
                e.description = '0 CPU / 0 GB RAM / 0 GB HHD / 0 IP';
                e.characteristicValues.forEach((ch) => {
                  if (ch.charName.toUpperCase() == 'CPU') {
                    e.description.replace(ch.charOptionValues[0] + " CPU", "0 CPU");
                  }
                  if (ch.charName == 'RAM') {
                    e.description = e.description.replace(/0 GB RAM/g, ch.charOptionValues[0] + " GB RAM");
                  }
                  if (ch.charName == 'HHD') {
                    e.description = e.description.replace(/0 GB HHD/g, ch.charOptionValues[0] + " GB HHD");
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

  onChangeTime() {
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() + Number(this.form.controls['numOfMonth'].value));
    this.expiredDate = dateNow;
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/project'])
  }

  updateVpc() {
    let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : this.data.quotaIpPublicCount;
    let IPFloating = this.selectIndexTab == 1 ? this.numberIpFloating : this.data.quotaIpFloatingCount;
    let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : this.data.quotaIpv6Count;
    if ((this.selectIndexTab == 0 && this.offerFlavor != undefined) || (this.selectIndexTab == 1 && this.vCPU != 0 && this.ram != 0)) {
      this.loadingCalculate = true;
      const requestBody =
      {
        newQuotavCpu: this.vCPU,
        newQuotaRamInGb: this.ram,
        newQuotaHddInGb: this.hhd,
        newQuotaSsdInGb: this.ssd,
        newQuotaBackupVolumeInGb: this.numberBackup,
        newQuotaSecurityGroupCount: this.numberSecurityGroup,
        // newQuotaKeypairCount: 0,// NON
        // newQuotaVolumeSnapshotCount: 0,//NON
        newQuotaIpPublicCount: this.selectIndexTab == 0 ? 1 : IPPublicNum,
        newQuotaIpFloatingCount: this.selectIndexTab == 0 ? 0 : IPFloating,
        newQuotaNetworkCount: this.numberNetwork,
        newQuotaRouterCount: this.numberRouter,
        newQuotaLoadBalancerSdnCount: this.numberLoadBalancer,
        newLoadBalancerOfferId: this.loadBalancerId, //NON
        newVpnSiteToSiteOfferId: this.siteToSiteId,
        newQuotaShareInGb: this.numberFileSystem,
        newQuotaShareSnapshotInGb: this.numberFileScnapsshot,
        newQuotaIpv6Count: this.selectIndexTab == 0 ? 0 : IPV6,
        typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
        serviceType: 1,
        serviceInstanceId: this.data.id,
        customerId: this.tokenService.get()?.userId,
        newOfferId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? this.data.offerId : this.offerFlavor.id) : 0,
        actionType: 12,
        regionId: this.regionId,
        serviceName: this.form.controls['name'].value
      }
      const request = {
        customerId: this.tokenService.get()?.userId,
        createdByUserId: this.tokenService.get()?.userId,
        note: "Cập nhật VPC",
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

      var returnPath: string = window.location.pathname;
      this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
    }
  }
  initIP() {
    this.activeIP = true;
    this.trashIP = true;
  }
  deleteIP() {
    this.activeIP = false;
    this.trashIP = false;
    this.numberIpPublic = 0;
    this.calculate()
  }
  initBackup() {
    this.activeBackup = true;
    this.trashBackup = true;
  }
  deleteBackup() {
    this.activeBackup = false;
    this.trashBackup = false;
    this.numberBackup = 0;
  }

  initLoadBalancer() {
    this.activeLoadBalancer = true;
  }

  initFileStorage() {
    this.activeFileStorage = true;
  }
  initVpnGpu() {
    this.activeVpnGpu = true;
    this.trashVpnGpu = true;
    this.getCatelogOffer();
    console.log("object")

  }
  deleteVpnGpu() {
    this.activeVpnGpu = false;
    this.trashVpnGpu = false;
  }

  changeTab(event: any) {
    this.selectIndexTab = event.index;
    console.log("selectIndexTab123", this.selectIndexTab)
  }

  loadListIpConnectInternet() {
    this.instancesService.getAllIPSubnet(this.regionId)
      .subscribe(
        data => {
          const IpConnectInternet = data.find(item => item.networkId === this.data.publicNetworkId);
          this.ipConnectInternet = IpConnectInternet != undefined ? IpConnectInternet.displayName : 'No Ip Connect Internet';
        }
      )
  }
  // getDetailTest
  private loadData() {
    // this.service.getDetailTest().subscribe(data=>
    //   console.log("data detail test", data)
    // )

    this.service.getDetail(this.activatedRoute.snapshot.paramMap.get('id'))
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
          // this.price.vcpu = 
          this.form.controls['name'].setValue(data.displayName);
          this.form.controls['description'].setValue(data.description);
          this.today = this.data.createDate;
          this.expiredDate = this.data.expireDate;
          this.vCPUOld = this.vCPU = data.quotavCpu;
          this.ramOld = this.ram = data.quotaRamInGb;
          this.hhdOld = this.hhd = data.quotaHddInGb;
          this.ssdOld = this.ssd = data.quotaSSDInGb;
          if (data.offerId != null) {
            this.selectIndexTab = 0;
          } else {
            this.selectIndexTab = 1;
          }

          this.numberNetwork = data.quotaNetworkCount
          this.numberRouter = data.quotaRouterCount
          this.numberSecurityGroup = data.quotaSecurityGroupCount
          this.numberBackup = data.quotaBackupVolumeInGb;
          this.numberLoadBalancer = data.quotaLoadBalancerSDNCount;
          this.numberFileSystem = data.quotaShareInGb;
          this.numberFileScnapsshot = data.quotaShareSnapshotInGb;
          this.numberIpFloating = data.quotaIpFloatingCount;
          this.numberIpPublic = data.quotaIpPublicCount;
          this.numberIpv6 = data.quotaIpv6Count;
          this.siteToSiteId = data.vpnSiteToSiteOfferId;
          this.loadBalancerId = data.offerIdLBSDN;
          if (data.quotaLoadBalancerSDNCount > 0) {
            this.activeLoadBalancer = true;
          }
          if (data.quotaBackupVolumeInGb > 0) {
            this.activeBackup = true;
          }
          if (data.quotaShareInGb > 0) {
            this.activeFileStorage = true;
          }
          if (data.vpnSiteToSiteOfferId != null) {
            this.activeSiteToSite = true;
          }

          this.checkConfigPackage(this.data?.offerId)
        }
      )
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
              this.listLoadbalancer = data;
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
              this.listSiteToSite = data;
            });
        }
      );
  }

  initVpnSiteToSite() {
    this.activeSiteToSite = true;
  }

  private calculateReal() {
    this.refreshValue();
    let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : this.data.quotaIpPublicCount;
    let IPFloating = this.selectIndexTab == 1 ? this.numberIpFloating : this.data.quotaIpFloatingCount;
    let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : this.data.quotaIpv6Count;
    if ((this.selectIndexTab == 0 && this.offerFlavor != undefined) || (this.selectIndexTab == 1 && this.vCPU != 0 && this.ram != 0)) {
      this.loadingCalculate = true;
      const requestBody =
      {
        newQuotavCpu: this.vCPU,
        newQuotaRamInGb: this.ram,
        newQuotaHddInGb: this.hhd,
        newQuotaSsdInGb: this.ssd,
        newQuotaBackupVolumeInGb: this.numberBackup,
        newQuotaSecurityGroupCount: this.numberSecurityGroup,
        // newQuotaKeypairCount: 0,// NON
        // newQuotaVolumeSnapshotCount: 0,//NON
        newQuotaIpPublicCount: this.selectIndexTab == 0 ? 1 : IPPublicNum,
        newQuotaIpFloatingCount: this.selectIndexTab == 0 ? 0 : IPFloating,
        newQuotaNetworkCount: this.numberNetwork,
        newQuotaRouterCount: this.numberRouter,
        newQuotaLoadBalancerSdnCount: this.numberLoadBalancer,
        newLoadBalancerOfferId: this.loadBalancerId, //NON
        newVpnSiteToSiteOfferId: this.siteToSiteId,
        newQuotaShareInGb: this.numberFileSystem,
        newQuotaShareSnapshotInGb: this.numberFileScnapsshot,
        newQuotaIpv6Count: this.selectIndexTab == 0 ? 1 : IPV6,
        typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
        serviceType: 12,
        serviceInstanceId: this.data.id,
        customerId: this.tokenService.get()?.userId,
        newOfferId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? this.data.offerId : this.offerFlavor.id) : 0,
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

  private getPriceEachComponent(data: any) {
    console.log(data.orderItemPrices);
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
      // if ( this.vCPU == this.data.quotavCpu && this.ram == this.data.quotaRamInGb && this.hhd == this.data.quotaHddInGb) {
      
        this.checkPackage = true
        console.log("checkPackage", this.checkPackage)
        this.selectIndexTab=0
      // }
      // else {
      //   this.checkPackage = false
      //   console.log("checkPackage2", this.checkPackage)
      // }

    }
    else {
      this.checkPackage = false
      this.selectIndexTab=1
      console.log("checkPackage3", this.checkPackage)
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
    console.log("object value", value)
    this.inputChangeSubject.next({ value, name });
  }
  checkNumberInput(value: number, name: string): void {
    const messageStepNotification = `Số lượng phải chia hết cho  ${this.stepBlock} `;
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue % this.stepBlock !== 0 && numericValue <= this.maxBlock && numericValue >= this.minBlock) {
      this.notification.warning('', messageStepNotification);
      switch (name) {
        case "hhd": {
          this.hhd = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
          break;
        }
        case "ssd": {
          this.ssd = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
          break;
        }
        case "backup": {
          this.numberBackup = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
          break;
        }
        case "fileSystem": {
          this.numberFileSystem = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
          break;
        }
        case "fileSnapshot": {
          this.numberFileScnapsshot = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
          break;
        }
      }
    }
  }

  findNameLoadBalance(loadBalancerId: number) {
    if (loadBalancerId) {
      const selectedLoadBalancer = this.listLoadbalancer.find(lb => lb.id === loadBalancerId)
      this.loadBalancerName = selectedLoadBalancer ? selectedLoadBalancer.offerName : null;
    } else {
      this.loadBalancerName = null;
    }
    // this.calculate();
  }

  findNameSiteToSite(siteToSiteId: number) {
    if (siteToSiteId) {
      const selectedSiteToSite = this.listSiteToSite.find(lb => lb.id === siteToSiteId)
      this.sitetositeName = selectedSiteToSite ? selectedSiteToSite.offerName : null;

    } else {
      this.sitetositeName = null;
    }
    // this.calculate();
  }
  getCatelogOffer(){
    this.instancesService.getTypeCatelogOffers(this.regionId, 'vm-gpu').subscribe(
      res => {
        this.listTypeCatelogOffer = res
        console.log("object123", res)
        this.listTypeCatelogOffer.forEach(() => this.numbergpu.push(0));
      }
    );
  }
  trackById(index: number, item: any): any {
    return item.offerName;
  }
  getValues() {
    console.log("loggg",this.numbergpu);
  }
}
