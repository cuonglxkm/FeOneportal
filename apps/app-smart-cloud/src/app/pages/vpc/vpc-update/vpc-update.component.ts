import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {NguCarouselConfig} from "@ngu/carousel";
import {OfferItem} from "../../instances/instances.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {InstancesService} from "../../instances/instances.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {getCurrentRegionAndProject} from "@shared";
import {finalize} from "rxjs/operators";
import {RegionModel, slider} from "../../../../../../../libs/common-utils/src";
import {VpcModel} from "../../../shared/models/vpc.model";
import {VpcService} from "../../../shared/services/vpc.service";

@Component({
  selector: 'one-portal-vpc-update',
  templateUrl: './vpc-update.component.html',
  styleUrls: ['./vpc-update.component.less'],
  animations: [slider],
})
export class VpcUpdateComponent implements OnInit{
  public carouselTileConfig: NguCarouselConfig = {
    grid: {xs: 1, sm: 1, md: 2, lg: 4, all: 0},
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
    {label: "IP Public", value: "0"},
    {label: "Ip Floating", value: "1"},
    {label: "IpV6", value: "2"},
  ];


  listOfferFlavors: OfferItem[] = [];
  offerFlavor: OfferItem;
  selectedElementFlavor: any;

  data: VpcModel;
  regionId: any;
  loadingCalculate = false;
  today = new Date();
  expiredDate = new Date();
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
  activeBackup = false;
  activeLoadBalancer = false;
  activeFileStorage = false;

  vCPU = 1;
  ram = 1;
  hhd = 0;
  ssd = 0;

  total: any;
  totalAmount = 0;
  totalPayment = 0;
  listLoadBalancer: any[];
  listIpConnectInternet: any[];
  selectIndexTab: any = 0;

  form = new FormGroup({
    name: new FormControl({
      value: 'loading data....',
      disabled: true
    }, {validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/),]}),
    description: new FormControl({value: 'loading data....', disabled: true}),

    ipConnectInternet: new FormControl({
      value: 'loading data....',
      disabled: true
    }, {validators: [Validators.required]}),
    numOfMonth: new FormControl({value: 1, disabled: true}, {validators: [Validators.required]}),
    //tab 1
    ipType: new FormControl({
      value: '',
      disabled: true
    }, {validators: this.selectIndexTab === 0 ? [Validators.required] : []}),
    //tab 2
    // vCPU: new FormControl(1, {validators: this.selectIndexTab === 1 ? [Validators.required] : []}),
    // ram: new FormControl(1, {validators: this.selectIndexTab === 1 ? [Validators.required] : []}),
    // hhd: new FormControl(0),
    // ssd: new FormControl(0),

  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private instancesService: InstancesService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              private ipService: IpPublicService,
              private activatedRoute: ActivatedRoute,
              private service: VpcService) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.loadData()
  }

  calculate() {
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
          newQuotaIpPublicCount: IPPublicNum,
          newQuotaIpFloatingCount: IPFloating,
          newQuotaNetworkCount: this.numberNetwork,
          newQuotaRouterCount: this.numberRouter,
          newQuotaLoadBalancerSdnCount: this.numberLoadBalancer,
          // newLoadBalancerOfferId: 0, //NON
          newQuotaShareInGb: this.numberFileSystem,
          newQuotaShareSnapshotInGb: this.numberFileScnapsshot,
          newQuotaIpv6Count: IPV6,
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
        }))
        .subscribe(
          data => {
            this.total = data;
            this.totalAmount = this.total.data.totalAmount.amount.toLocaleString();
            this.totalPayment = this.total.data.totalPayment.amount.toLocaleString()
          }
        );
    } else {
      this.total = undefined;
    }
  }

  onChangeConfigCustom() {

  }

  onInputFlavors(event: any) {
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
    this.router.navigate(['/app-smart-cloud/vpc'])
  }

  onChangeTime() {
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() + Number(this.form.controls['numOfMonth'].value));
    this.expiredDate = dateNow;
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/vpc'])
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
          newQuotaIpPublicCount: IPPublicNum,
          newQuotaIpFloatingCount: IPFloating,
          newQuotaNetworkCount: this.numberNetwork,
          newQuotaRouterCount: this.numberRouter,
          newQuotaLoadBalancerSdnCount: this.numberLoadBalancer,
          // newLoadBalancerOfferId: 0, //NON
          newQuotaShareInGb: this.numberFileSystem,
          newQuotaShareSnapshotInGb: this.numberFileScnapsshot,
          newQuotaIpv6Count: IPV6,
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
            price: 0,
          }
        ]
      }

      var returnPath: string = window.location.pathname;
      this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
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

  changeTab(event: any) {
    this.selectIndexTab = event.index;
  }

  loadListIpConnectInternet() {
    this.instancesService.getAllIPSubnet(this.regionId)
      .subscribe(
        data => {
          const IpConnectInternet = data.find(item => item.networkId === this.data.publicNetworkId);
          this.form.controls['ipConnectInternet'].setValue(IpConnectInternet != undefined ? IpConnectInternet.displayName : 'No Ip Connect Internet');
        }
      )
  }

  private loadData() {
    this.service.getDetail(this.activatedRoute.snapshot.paramMap.get('id'))
      .pipe(finalize(() => {
        this.loadListIpConnectInternet();
        this.initFlavors();
      }))
      .subscribe(
        data => {
          this.data = data;
          this.form.controls['name'].setValue(data.cloudProjectName);
          this.form.controls['description'].setValue(data.description);
          this.vCPU = data.quotavCpu;
          this.ram = data.quotaRamInGb;
          this.hhd = data.quotaHddInGb;
          this.ssd = data.quotaSSDInGb;
          if (data.offerId != null) {
            this.selectIndexTab = 0;
            if (data.quotaIpv6Count != 0) {
              this.form.controls['ipType'].setValue('2');
            } else if (data.quotaIpPublicCount != 0) {
              this.form.controls['ipType'].setValue('0');
            } else if (data.quotaIpFloatingCount != 0) {
              this.form.controls['ipType'].setValue('1');
            }
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
        }
      )
  }
}
