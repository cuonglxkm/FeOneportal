import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NguCarouselConfig} from "@ngu/carousel";
import {ImageTypesModel, OfferItem} from "../../instances/instances.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {InstancesService} from "../../instances/instances.service";
import {getCurrentRegionAndProject} from "@shared";
import {Router} from "@angular/router";
import {finalize} from "rxjs/operators";
import {slider} from "../../../../../../../libs/common-utils/src";
import {IpPublicService} from "../../../shared/services/ip-public.service";

@Component({
  selector: 'one-portal-vpc-create',
  templateUrl: './vpc-create.component.html',
  styleUrls: ['./vpc-create.component.less'],
  animations: [slider],
})

export class VpcCreateComponent {
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
    {label: "IP Public" , value: "0"},
    {label: "Ip Floating" , value: "1"},
    {label: "IpV6" , value: "2"},
  ];


  listOfferFlavors: OfferItem[] = [];
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
  openIPType = false;
  activeBackup = false;
  activeLoadBalancer = false;
  activeFileStorage = false;

  total: any;
  totalAmount = 0;
  totalPayment = 0;
  listLoadBalancer: any[];
  listIpConnectInternet: any[];
  disableIpConnectInternet = false;
  loadingIpConnectInternet = false;
  selectIndexTab: any = 0;

  form = new FormGroup({
    name: new FormControl('', {validators: [Validators.required,Validators.pattern(/^[A-Za-z0-9]+$/),]}),
    description: new FormControl(''),

    ipConnectInternet: new FormControl('', {validators: [Validators.required]}),
    numOfMonth: new FormControl(1, {validators: [Validators.required]}),
    //tab 1
    ipType: new FormControl('', {validators: this.selectIndexTab === 0 ? [Validators.required] : []}),
    //tab 2
    vCPU: new FormControl(1, {validators: this.selectIndexTab === 1 ? [Validators.required] : []}),
    ram: new FormControl(1, {validators: this.selectIndexTab === 1 ? [Validators.required] : []}),
    hhd: new FormControl(0),
    ssd: new FormControl(0),

  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private instancesService: InstancesService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              private ipService: IpPublicService,) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.initFlavors();
    this.loadListIpConnectInternet();
  }

  calculate() {
    let lstIp = this.form.controls['ipConnectInternet'].value.split("--");
    let ip = '';
    let ipName = '';
    if (lstIp != null && lstIp != undefined){
      ip = lstIp[0];
      let listString = lstIp[1].split(" ");
      if (listString.length == 3) {
        ipName = listString[2].trim();
      }
    }
    let numOfMonth = this.form.controls['numOfMonth'].value;
    let ipType = this.form.controls['ipType'].value;
    let vCPU = this.form.controls['vCPU'].value;
    let ram = this.form.controls['ram'].value;

    let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : (ipType == '0' && this.offerFlavor.ipNumber != undefined ? this.offerFlavor.ipNumber : 0);
    let IPFloating = this.selectIndexTab == 1 ? this.numberIpFloating : (ipType == '1' && this.offerFlavor.ipNumber != undefined ? this.offerFlavor.ipNumber : 0);
    let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : (ipType == '2' ? this.offerFlavor.ipNumber : 0);
    if (ip != '') {
      if ((this.selectIndexTab == 0 && ipType != '' && this.offerFlavor != undefined) || (this.selectIndexTab == 1 && vCPU != 0 && ram != 0)) {
        this.loadingCalculate = true;
        const requestBody =
          {
            quotavCpu: vCPU,
            quotaRamInGb: ram,
            quotaHddInGb: this.form.controls['hhd'].value,
            quotaSSDInGb: this.form.controls['ssd'].value,
            quotaBackupVolumeInGb: this.numberBackup,
            quotaSecurityGroupCount: this.numberSecurityGroup,
            // quotaKeypairCount: 0,// NON
            // quotaVolumeSnapshotCount: 0,//NON
            quotaIpPublicCount: IPPublicNum,
            quotaIpFloatingCount: IPFloating,
            quotaNetworkCount: this.numberNetwork,
            quotaRouterCount: this.numberRouter,
            quotaLoadBalancerSDNCount: this.numberLoadBalancer,
            // loadBalancerOfferId: 0, //NON
            quotaShareInGb: this.numberFileSystem,
            QuotaShareSnapshotInGb: this.numberFileScnapsshot,
            publicNetworkId: ip,
            publicNetworkAddress: ipName,
            quotaIPv6Count: IPV6,
            typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
            serviceType: 12,
            serviceInstanceId: 0,
            customerId: this.tokenService.get()?.userId,
            offerId: this.offerFlavor == null ? "" : this.offerFlavor.id,
            // offerId: 0,
            actionType: 0,
            regionId: this.regionId,
            serviceName: this.form.controls['name'].value
          }
        const request = {
          orderItems: [
            {
              orderItemQuantity: 1,
              specificationString: JSON.stringify(requestBody),
              specificationType: "vpc_create",
              sortItem: 0,
              serviceDuration: numOfMonth
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
      }else {
        this.total = undefined;
      }
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
    this.instancesService
      .getListOffersByProductId('150')
      .subscribe((data: any) => {
        this.listOfferFlavors = data.filter(
          (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
        );

        this.listOfferFlavors.forEach((e: OfferItem) => {
          e.description = '';
          e.characteristicValues.forEach((ch) => {
            if (ch.charName == 'vcpu') {
              e.description += ch.charOptionValues[0] + ' VCPU / ';
            }
            if (ch.charName == 'ram') {
              e.description += ch.charOptionValues[0] + ' GB RAM / ';
            }
            if (ch.charName == 'hdd') {
              e.description += ch.charOptionValues[0] + ' GB HHD / ';
            }
            if (ch.charName == 'ip') {
              e.description += ch.charOptionValues[0] + ' IP ';
              e.ipNumber = ch.charOptionValues[0];
            }
          });
        });
        this.cdr.detectChanges();
      });
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.router.navigate(['/app-smart-cloud/vpc'])
  }

  onChangeTime() {
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() + Number(this.form.controls['numOfMonth'].value));
    this.expiredDate = dateNow;
    this.calculate();
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/vpc'])
  }

  createIpPublic() {
    let lstIp = this.form.controls['ipConnectInternet'].value.split("--");
    let ip = '';
    let ipName = '';
    if (lstIp != null && lstIp != undefined){
      ip = lstIp[0];
      let listString = lstIp[1].split(" ");
      if (listString.length == 3) {
        ipName = listString[2].trim();
      }
    }
    let numOfMonth = this.form.controls['numOfMonth'].value;
    let ipType = this.form.controls['ipType'].value;
    let vCPU = this.form.controls['vCPU'].value;
    let ram = this.form.controls['ram'].value;

    let IPPublicNum = this.selectIndexTab == 1 ? this.numberIpPublic : (ipType == '0' && this.offerFlavor.ipNumber != undefined ? this.offerFlavor.ipNumber : 0);
    let IPFloating = this.selectIndexTab == 1 ? this.numberIpFloating : (ipType == '1' && this.offerFlavor.ipNumber != undefined ? this.offerFlavor.ipNumber : 0);
    let IPV6 = this.selectIndexTab == 1 ? this.numberIpv6 : (ipType == '2' ? this.offerFlavor.ipNumber : 0);
    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() + Number(numOfMonth));
    const requestBody = {
      quotavCpu: vCPU,
      quotaRamInGb: ram,
      quotaHddInGb: this.form.controls['hhd'].value,
      quotaSSDInGb: this.form.controls['ssd'].value,
      quotaBackupVolumeInGb: this.numberBackup,
      quotaSecurityGroupCount: this.numberSecurityGroup,
      // quotaKeypairCount: null,// NON
      // quotaVolumeSnapshotCount: null,//NON
      quotaIpPublicCount: IPPublicNum,
      quotaIpFloatingCount: IPFloating,
      quotaIpv6Count: IPV6,
      quotaNetworkCount: this.numberNetwork,
      quotaRouterCount: this.numberRouter,
      quotaLoadBalancerSDNCount: this.numberLoadBalancer,
      // loadBalancerOfferId: null, //NON
      quotaShareInGb: this.numberFileSystem,
      quotaShareSnapshotInGb: this.numberFileScnapsshot,
      publicNetworkId: ip,
      publicNetworkAddress: ipName,
      typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
      serviceType: 12,
      serviceInstanceId: 0,
      customerId: this.tokenService.get()?.userId,
      offerId: this.offerFlavor == null ? "" : this.offerFlavor.id,
      actionType: 0,
      regionId: this.regionId,
      serviceName: 'vpc'+this.tokenService.get()?.userId+'-'+this.form.controls['name'].value,
      description: null,
      createDate: new Date(),
      expireDate: expiredDate,
    }
    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: "Tạo VPC",
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(requestBody),
          specificationType: "vpc_create",
          price: 0,
          serviceDuration: numOfMonth
        }
      ]
    }

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
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
      )
  }
}
