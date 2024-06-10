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
  dateNow:any;
  today: any;
  expiredDate: any;

  numberNetwork: number = 0;
  numberRouter: number = 0;
  numberSecurityGroup: number = 0;

  vCPU = 0;
  ram = 0;
  hhd = 0;
  ssd = 0;

  ipConnectInternet = '';
  numberIpFloating: number = 0;
  numberIpPublic: number = 0;
  numberIpv6: number = 0;

  numberSnapshothdd:number =0;
  numberSnapshotssd:number =0;

  numberBackup: number = 0;

  numberLoadBalancer: number = 0;
  loadBalancerId : number;
  loadBalancerName:string;

  numberFileSystem: number = 0;
  numberFileScnapsshot: number = 0;
 

  siteToSiteId: number;
  sitetositeName:string;

  gpuQuotasGobal: { GpuOfferId: number, GpuCount: number, GpuType: string, GpuPrice:number, GpuPriceUnit:number}[] = [];
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

  activeVpnGpu= false;
  trashVpnGpu = false;

  activeSnapshot= false;
  trashSnapshot = false;

  offerIdOld:number=0;
  vCPUOld = 0;
  ramOld = 0;
  hhdOld = 0;
  ssdOld = 0;
  ipv6Old :number=0;
  ipPublicOld:number =0;

  ipPublicTotal:number =0;
  ipPublicAddOld:number=0;
  ipPublicOffer:number=0;

  ipFloatingOld:number=0;
  backupOld:number=0;
  snapshothddOld:number=0;
  snapshotssdOld:number=0;
  loadBalancerOld:number=0;
  fileSnapshotOld:number=0;
  fileSystemOld:number=0;
  vpnsitetositeIdOld:number=0;
  vpnsitetositeNameOld:string='';
  loadbalancerOfferNameOld:string='';
  gpuOld:any;


  


  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;
  selectPackge = '';
  listLoadbalancer: OfferDetail[] = [];
  listSiteToSite: OfferDetail[] = [];
  listIpConnectInternet: any[];
  private searchSubject = new Subject<string>();
  selectIndexTab: number=0;
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
    snapshothdd:0,
    snapshothddUnit:0,
    snapshotssd:0,
    snapshotssdUnit:0,

    loadBalancer: 0,
    loadBalancerUnit: 0,
    fileStorage: 0,
    fileStorageUnit: 0,
    filestorageSnapshot: 0,
    filestorageSnapshotUnit: 0,
    siteToSite: 0,
    siteToSiteUnit: 0
  };
  checkPackage: boolean = true;
  activeBonusService = true;
  iconToggle: string;

  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;


  listTypeCatelogOffer:any;

  // numbergpu: number[] = [];
  

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
    // this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((search: any) => {
    //   this.calculateReal();
    // });
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
    this.calculateReal();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.calculateReal();
    });
    this.dateNow =new Date();
    this.calculate()
    // this.getOffer();
   
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
  // checkOfferById:OfferItem
  offerType:string
  listOfferByTypeName: OfferItem[]=[];
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
              console.log("selectedElementFlavor", this.selectedElementFlavor)
            }))
            .subscribe((data: any) => {
              this.listOfferFlavors = data.filter(
                (e: OfferItem) => 
                  e.status.toUpperCase() == 'ACTIVE'
              );             
              const checkOfferById = this.listOfferFlavors.find((offer:OfferItem)=>
                offer.id === this.data?.offerId 
              )             
              const charName = checkOfferById?.characteristicValues.find((typeName)=>typeName.charName==='VolumeType')
              const typeName = charName?.charOptionValues?.[0]
             this.listOfferByTypeName = this.listOfferFlavors.filter((e:OfferItem)=> 
              e.characteristicValues.find((charName)=>charName.charName==='VolumeType')?.charOptionValues?.[0]==typeName
            )
            console.log("listOfferByTypeNamelistOfferByTypeName", this.listOfferByTypeName)

              this.listOfferFlavors.forEach((e: OfferItem) => {
                e.description = '0 CPU / 0 GB RAM / 0 GB HDD / 0 IP';
                e.characteristicValues.forEach((ch) => {
                  if (ch.charName.toUpperCase() == 'CPU') {
                    e.description.replace(ch.charOptionValues[0] + " CPU", "0 CPU");
                  }
                  if (ch.charName == 'RAM') {
                    e.description = e.description.replace(/0 GB RAM/g, ch.charOptionValues[0] + " GB RAM");
                  }
                  // if (ch.charName == 'VolumeType') {
                  //   // if(ch.charOptionValues[0]=='HDD'){
                  //     e.description = e.description.replace(/0 GB HHD/g, ch.charOptionValues[0] + " GB HDD");
                  //     // e.description=ch.description
                  //   // }
                   
                  // }
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
  // findTypeOffer(typeName:string){
  //   this.checkOfferById.find()
  // }
  // getOffer(){
  //   const listOffer = this.listOfferFlavors.find((offer) => offer.id === this.data?.offerId)
  //   console.log("listOffer",listOffer)
  // }

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
    // let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : this.data.quotaIpPublicCount;
    // let IPFloating = this.selectIndexTab == 1 ? this.numberIpFloating : this.data.quotaIpFloatingCount;
    // let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : this.data.quotaIpv6Count;
    if ((this.selectIndexTab == 0 && this.offerFlavor != undefined) || (this.selectIndexTab == 1 ||(this.vCPU != 0 && this.ram != 0) )) {
      this.loadingCalculate = true;
      const requestBody =
      {
        newQuotavCpu: this.vCPU + this.vCPUOld,
        newQuotaRamInGb: this.ram + this.ramOld,
        newQuotaHddInGb: this.hhd +this.hhdOld,
        newQuotaSsdInGb: this.ssd +this.ssdOld,

        newQuotaIpPublicCount:this.selectIndexTab==0? (this.numberIpPublic + this.ipPublicAddOld) : (this.numberIpPublic + this.ipPublicTotal),
        newQuotaIpFloatingCount: this.numberIpFloating + this.ipFloatingOld,
        newQuotaIpv6Count:this.numberIpv6 + this.ipv6Old,
        newQuotaBackupVolumeInGb: this.numberBackup + this.backupOld,
        newQuotaLoadBalancerSdnCount:this.numberLoadBalancer + this.loadBalancerOld,
        newLoadBalancerOfferId:this.loadBalancerId,
        newQuotaShareInGb: this.numberFileSystem +this.fileSystemOld,
        newQuotaShareSnapshotInGb:this.numberFileScnapsshot + this.fileSnapshotOld,
        newVpnSiteToSiteOfferId: this.siteToSiteId,

        newQuotaSecurityGroupCount: this.numberSecurityGroup,
        newQuotaNetworkCount: this.numberNetwork,
        newQuotaRouterCount: this.numberRouter,
        gpuQuotas: this.gpuQuotasGobal,
        newQuotaVolumeSnapshotHddInGb: this.numberSnapshothdd +this.snapshothddOld,
        newQuotaVolumeSnapshotSsdInGb: this.numberSnapshotssd + this.snapshotssdOld,
        

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
  // openIpSubnet() {
  //   this.calculate();
  // }

  changeTab(event: any) {
    console.log("event", event)
    this.selectIndexTab = event.index;

    console.log("selectIndexTab123", this.selectIndexTab)
  }

  // loadListIpConnectInternet() {
  //   this.instancesService.getAllIPSubnet(this.regionId)
  //     .subscribe(
  //       data => {
  //         console.log("getAllIPSubnet", data)
  //         const IpConnectInternet = data.find((item:any) => item.networkId === this.data.publicNetworkId);
  //         this.ipConnectInternet = IpConnectInternet != undefined ? IpConnectInternet.displayName : 'No Ip Connect Internet';
  //       }
  //     )
  // }

  loadListIpConnectInternet() {
    // this.loadingIpConnectInternet = true;
    // this.disableIpConnectInternet = true;
    this.instancesService.getAllIPSubnet(this.regionId)
      .pipe(finalize(() => {
        // this.disableIpConnectInternet = false;
        // this.loadingIpConnectInternet = false;
      }))
      .subscribe(
        data => {
          this.listIpConnectInternet = data;
          console.log("ob this.listIpConnectInternetject",  this.listIpConnectInternet)
        }
      );
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
          this.checkConfigPackage(this.data?.offerId)

          // this.price.vcpu = 
          this.form.controls['name'].setValue(data.displayName);
          this.form.controls['description'].setValue(data.description);
          this.today = this.data.createDate;
          this.expiredDate = this.data.expireDate;
          // this.vCPUOld = this.vCPU = data.quotavCpu;
          // this.ramOld = this.ram = data.quotaRamInGb;
          // this.hhdOld = this.hhd = data.quotaHddInGb;
          // this.ssdOld = this.ssd = data.quotaSSDInGb;

          this.vCPUOld =  data.quotavCpu;
          this.ramOld =  data.quotaRamInGb;
          this.hhdOld =  data.quotaHddInGb;
          this.ssdOld =  data.quotaSSDInGb;
          this.ipv6Old = data.quotaIpv6Count;

          this.ipFloatingOld = data.quotaIpFloatingCount;
          this.backupOld = data.quotaBackupVolumeInGb;
         this.loadBalancerOld = data.quotaLoadBalancerSDNCount;
          this.fileSystemOld = data.quotaShareInGb;
          this.fileSnapshotOld = data.quotaShareSnapshotInGb;
          this.vpnsitetositeNameOld = data.vpnSiteToSiteOfferName;
          this.loadbalancerOfferNameOld = data.loadbalancerOfferName;
          this.gpuOld = data.gpuProjects;
          this.snapshothddOld = data.quotaVolumeSnapshotHddInGb;
          this.snapshotssdOld = data.quotaVolumeSnapshotSsdInGb;

          this.numberNetwork = data.quotaNetworkCount;
          this.numberRouter = data.quotaRouterCount;
          this.numberSecurityGroup = data.quotaSecurityGroupCount;
          this.ipPublicOffer = data.offerDetail?.ipPublic;
          this.ipPublicTotal= data.quotaIpPublicCount;
          this.ipPublicAddOld =  this.ipPublicTotal - this.ipPublicOffer;
          this.offerIdOld = data.offerId

          // if (data.offerId != null) {
          //   this.selectIndexTab = 0;
          // } else {
          //   this.selectIndexTab = 1;
          // }

          // this.numberNetwork = data.quotaNetworkCount
          // this.numberRouter = data.quotaRouterCount
          // this.numberSecurityGroup = data.quotaSecurityGroupCount
          // this.numberBackup = data.quotaBackupVolumeInGb;
          // this.numberLoadBalancer = data.quotaLoadBalancerSDNCount;
          // this.numberFileSystem = data.quotaShareInGb;
          // this.numberFileScnapsshot = data.quotaShareSnapshotInGb;
          // this.numberIpFloating = data.quotaIpFloatingCount;
          // this.numberIpPublic = data.quotaIpPublicCount;
          // this.numberIpv6 = data.quotaIpv6Count;
          // this.siteToSiteId = data.vpnSiteToSiteOfferId;
          // this.loadBalancerId = data.offerIdLBSDN;
          // if (data.quotaLoadBalancerSDNCount > 0) {
          //   this.activeLoadBalancer = true;
          // }
          // if (data.quotaBackupVolumeInGb > 0) {
          //   this.activeBackup = true;
          // }
          // if (data.quotaShareInGb > 0) {
          //   this.activeFileStorage = true;
          // }
          // if (data.vpnSiteToSiteOfferId != null) {
          //   this.activeSiteToSite = true;
          // }
          // console.log("this.data?.offerId", this.data.offerId)
          // this.checkConfigPackage(this.data?.offerId)
          
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
              // this.loadBalancerId = this.listLoadbalancer[0].id
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

  // calculateReal() {
  //   this.refreshValue();
  //   if (this.vpcType == '1') {
  //     let lstIp = this.ipConnectInternet?.split('--');
  //     let ip = '';
  //     let ipName = '';
  //     if (lstIp != null && lstIp != undefined) {
  //       ip = lstIp[0];
  //     }
      

  //     let IPPublicNum = this.numberIpPublic;
  //     let IPFloating = this.ipConnectInternet != null && this.ipConnectInternet != '' ? this.numberIpFloating : 0;
  //     let IPV6 = this.numberIpv6;
  //     // if (( this.offerFlavor != undefined) || ( this.vCPU != 0 && this.ram != 0)) {
  //     // if ((this.selectIndexTab == 0 && this.offerFlavor != undefined) || (this.selectIndexTab == 1 && this.vCPU != 0 && this.ram != 0)) {
  //     console.log("offerFlavor", this.offerFlavor)
  //     if ((this.selectIndexTab == 0 || this.offerFlavor != undefined) || (this.selectIndexTab == 1 || (this.vCPU != 0 && this.ram != 0))) {
  //       console.log("lstIp", lstIp)
  //       if (lstIp != null && lstIp != undefined && lstIp[1] != null) {
  //         let listString = lstIp[1].split(' ');
  //         if (listString.length == 3) {
  //           ipName = listString[2].trim();
  //         }
  //       }

  //       this.loadingCalculate = true;
  //       const requestBody = {
  //         quotavCpu: this.vCPU,
  //         quotaRamInGb: this.ram,
  //         quotaHddInGb: this.hhd,


  //         quotaSSDInGb: this.ssd,
  //         quotaBackupVolumeInGb: this.numberBackup,
  //         quotaSecurityGroupCount: this.numberSecurityGroup,
  //         projectType: this.vpcType,
  //         // quotaKeypairCount: 0,// NON
  //         // quotaVolumeSnapshotCount: 0,//NON
  //         quotaIpPublicCount: IPPublicNum,
  //         quotaIpFloatingCount: IPFloating,
  //         quotaNetworkCount: this.numberNetwork,
  //         quotaRouterCount: this.numberRouter,
  //         quotaLoadBalancerSDNCount: this.numberLoadBalancer,
  //         loadBalancerOfferId: this.loadBalancerId,
  //         vpnSiteToSiteOfferId: this.siteToSiteId,
  //         quotaShareInGb: this.numberFileSystem,
  //         QuotaShareSnapshotInGb: this.numberFileScnapsshot,
  //         publicNetworkId: ip,
  //         publicNetworkAddress: ipName,
  //         quotaIPv6Count: IPV6,
        

  //         gpuQuotas: this.gpuQuotasGobal,
  //         quotaVolumeSnapshotInGb: this.numberSnapshothdd,

  //         // typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.VpcCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
  //         // serviceType: 12,
  //         serviceInstanceId: 0,
  //         customerId: this.tokenService.get()?.userId,
  //         offerId: this.selectIndexTab == 0 ? (this.offerFlavor == null ? 0 : this.offerFlavor.id) : 0,


  //         actionType: 0,
  //         regionId: this.regionId,
  //         serviceName: this.form.controls['name'].value
  //       };
  //       console.log("requestBody", requestBody)
  //       const request = {
  //         orderItems: [
  //           {
  //             orderItemQuantity: 1,
  //             specificationString: JSON.stringify(requestBody),
  //             specificationType: 'vpc_create',
  //             sortItem: 0,
  //             serviceDuration: this.numOfMonth
  //           }
  //         ]
  //       };
  //       this.ipService.getTotalAmount(request)
  //         .pipe(finalize(() => {
  //           this.loadingCalculate = false;
  //         }))
  //         .subscribe(
  //           data => {
  //             this.total = data;
  //             this.totalAmount = this.total.data.totalAmount.amount
  //             this.totalPayment = this.total.data.totalPayment.amount;
  //             this.totalVAT = this.total.data.totalVAT.amount;
  //             this.getPriceEachComponent(data.data);
              
  //           }
  //         );
  //     } else {
  //       this.total = undefined;
  //     }
  //   }
  // }


  private calculateReal() {
    this.refreshValue();


    let lstIp = this.ipConnectInternet?.split('--');
    let ip = '';
    let ipName = '';
    if (lstIp != null && lstIp != undefined) {
      ip = lstIp[0];
    }
    // let IPPublicNum = this.numberIpPublic;
    let IPFloating = this.ipConnectInternet != null && this.ipConnectInternet != '' ? this.numberIpFloating : 0;
    let IPV6 = this.numberIpv6;


    // let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : this.data.quotaIpPublicCount;
    // let IPFloating = this.selectIndexTab == 1 ? this.numberIpFloating : this.data.quotaIpFloatingCount;
    // let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : this.data.quotaIpv6Count;
    if ((this.selectIndexTab == 0 || this.offerFlavor != undefined) || (this.selectIndexTab == 1 ||(this.vCPU != 0 && this.ram != 0) )) {
      this.loadingCalculate = true;
      const requestBody =
      {

        newQuotavCpu: this.vCPU + this.vCPUOld,
        newQuotaRamInGb: this.ram + this.ramOld,
        newQuotaHddInGb: this.hhd +this.hhdOld,
        newQuotaSsdInGb: this.ssd +this.ssdOld,
       

        // newQuotaIpPublicCount:this.numberIpPublic,
        newQuotaIpPublicCount:this.selectIndexTab==0? (this.numberIpPublic + this.ipPublicAddOld) : (this.numberIpPublic + this.ipPublicTotal),
        newQuotaIpFloatingCount: this.numberIpFloating + this.ipFloatingOld,
        newQuotaIpv6Count:this.numberIpv6 + this.ipv6Old,
        newQuotaBackupVolumeInGb: this.numberBackup + this.backupOld,
        newQuotaLoadBalancerSdnCount:this.numberLoadBalancer + this.loadBalancerOld,
        newLoadBalancerOfferId:this.loadBalancerId,
        newQuotaShareInGb: this.numberFileSystem +this.fileSystemOld,
        newQuotaShareSnapshotInGb:this.numberFileScnapsshot + this.fileSnapshotOld,
        newVpnSiteToSiteOfferId: this.siteToSiteId,

        newQuotaSecurityGroupCount: this.numberSecurityGroup,
        newQuotaNetworkCount: this.numberNetwork,
        newQuotaRouterCount: this.numberRouter,
        // newQuotaKeypairCount: 0,// NON
        // newQuotaVolumeSnapshotCount: 0,//NON
        // newQuotaIpPublicCount: this.selectIndexTab == 0 ? 1 : IPPublicNum,
        // newQuotaIpFloatingCount: this.selectIndexTab == 0 ? 0 : IPFloating,
     
        // newQuotaLoadBalancerSdnCount: this.numberLoadBalancer,
        // newLoadBalancerOfferId: this.loadBalancerId, //NON
       
        // newQuotaShareInGb: this.numberFileSystem,
        // newQuotaShareSnapshotInGb: this.numberFileScnapsshot,
        // newQuotaIpv6Count: this.selectIndexTab == 0 ? 1 : IPV6,
      

        gpuQuotas: this.gpuQuotasGobal,
        
        newQuotaVolumeSnapshotHddInGb: this.numberSnapshothdd +this.snapshothddOld,
        newQuotaVolumeSnapshotSsdInGb: this.numberSnapshotssd + this.snapshotssdOld,

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
            console.log("totalmont",data )
            this.total = data;
            // this.totalAmount = this.total.data.totalAmount.amount;
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
        console.log(" this.price.hhdPerUnit", this.price.hhdPerUnit)
      }
      else if (item.typeName == 'Nvidia A30') {     
        console.log("this.gpuQuotasGobal555", this.gpuQuotasGobal)   
        for(let gpu of this.gpuQuotasGobal){
          if(gpu.GpuType =='Nvidia A30'){
            gpu.GpuPrice = item.totalAmount.amount;
            gpu.GpuPriceUnit = item.unitPrice.amount;
          }
        }
            
      }
      else if (item.typeName == 'Nvidia A100') {
        for(let gpu of this.gpuQuotasGobal){
          if(gpu.GpuType =='Nvidia A100'){
            gpu.GpuPrice = item.totalAmount.amount;
            gpu.GpuPriceUnit = item.unitPrice.amount;
          }
        }
      }
      else if(item.typeName == 'snapshot-hdd'){
        this.price.snapshothdd = item.totalAmount.amount;
        this.price.snapshothddUnit = item.unitPrice.amount;
      }
      else if(item.typeName == 'snapshot-ssd'){
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
        this.selectIndexTab=0
        this.checkPackage = true
    }
    else {
      this.selectIndexTab=1
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
    console.log("object value", value)
    this.inputChangeSubject.next({ value, name });
  }
  checkNumberInput(value: number, name: string): void {
    const messageStepNotification = `Số lượng phải chia hết cho  ${this.stepBlock} `;
    const numericValue = Number(value);
    if(isNaN(numericValue) ){
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
  getCatelogOffer() {
    this.instancesService.getTypeCatelogOffers(this.regionId, 'vm-gpu').subscribe(
      res => {
        this.listTypeCatelogOffer = res
        console.log("listTypeCatelogOffer", res)
        this.gpuQuotasGobal = this.listTypeCatelogOffer.map((item:any) => ({
          GpuOfferId: item.id,
          GpuCount: 0,
          GpuType: item.offerName,
          GpuPrice:0,
          GpuPriceUnit:item?.price?.fixedPrice?.amount
        }));
        console.log("gpuQuotasGobal", this.gpuQuotasGobal)
      }
    );
  }
  maxNumber: number[] = [8, 8];
  getValues(index:number, value:number): void {

    console.log("index",index)
    console.log("value",value)
    console.log("gpuQuotasGobal 123",this.gpuQuotasGobal )
    // console.log(this.gpuQuotasGobal[index].GpuCount);
    if (index == 0) {
      if (this.gpuQuotasGobal[0].GpuCount <= this.maxTotal) {
        this.maxNumber[1] = this.maxTotal - this.gpuQuotasGobal[0].GpuCount;
        if (this.gpuQuotasGobal[1].GpuCount > 0 && this.gpuQuotasGobal[1].GpuCount > this.maxNumber[1]) {
          this.notification.warning('', 'Bạn chỉ có thể mua tổng 2 loại GPU tối đa là 8');
          this.gpuQuotasGobal[1].GpuCount = this.maxNumber[1]
        }
      }
    }
    else {
      if (this.gpuQuotasGobal[1].GpuCount <= this.maxTotal) {
        this.maxNumber[0] = this.maxTotal - this.gpuQuotasGobal[1].GpuCount
        if (this.gpuQuotasGobal[0].GpuCount > 0 && this.gpuQuotasGobal[0].GpuCount > this.maxNumber[0]) {
          this.notification.warning('', 'Bạn chỉ có thể mua tổng 2 loại GPU tối đa là 8');
          this.gpuQuotasGobal[0].GpuCount = this.maxNumber[0]
        }
      }
    }
    this.calculate();
    
  }

  getMaxValue(index: number): number {
    if (this.gpuQuotasGobal[index].GpuCount < 8) {
      return this.maxNumber[index];
    }
  }

  trackById(index: number, item: any): any {
    return item.offerName;
  }

  // Hàm kiểm tra nếu có bất kỳ GpuCount nào bằng 0
  // isGpuCountZero(): boolean {
  //   for (let i = 0; i < this.gpuQuotasGobal.length; i++) {
  //     if (this.gpuQuotasGobal[i].GpuCount === 0) {
  //       return true;
  //     }
  //   }
  //   return false;
    
  // }

  initIP() {
    this.activeIP = true;
    this.trashIP = true;
  }
  deleteIP() {
    this.activeIP = false;
    this.trashIP = false;
    this.ipConnectInternet='';
    this.numberIpPublic = 0;
    this.numberIpv6 =0;
    this.numberIpFloating=0;

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
    this.calculate()
  }

  initLoadBalancer() {
    this.activeLoadBalancer = true;
    this.trashLoadBalancer = true;
    this.loadBalancerId = this.listLoadbalancer[0].id;
    this.findNameLoadBalance(this.loadBalancerId);
  }
  deleteLoadBalancer() {
    this.activeLoadBalancer = false;
    this.trashLoadBalancer = false
    this.numberLoadBalancer=0;
    this.loadBalancerId =null;
    this.calculate()
  }

  initFileStorage() {
    this.activeFileStorage = true;
    this.trashFileStorage = true;
  }
  deleteFileStorage(){
    this.activeFileStorage = false;
    this.trashFileStorage = false;
    this.numberFileSystem=0;
    this.numberFileScnapsshot=0;
    this.calculate()
  }
  initVpnSiteToSite() {
    this.activeSiteToSite = true;
    this.trashVpnSiteToSite = true;
    this.siteToSiteId = this.listSiteToSite[1].id;
    this.findNameSiteToSite(this.siteToSiteId)
  }
  deleteVpnSiteToSite(){
    this.activeSiteToSite = false;
    this.trashVpnSiteToSite = false;
    this.siteToSiteId = null
    this.sitetositeName=""
    this.calculate()
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
    this.gpuQuotasGobal =[ ]
    this.calculate()
  }
  initSnapshot(){
    this.activeSnapshot = true;
    this.trashSnapshot = true;
  }

  deleteSnapshot(){
    this.activeSnapshot = false;
    this.trashSnapshot = false;
  }
}
