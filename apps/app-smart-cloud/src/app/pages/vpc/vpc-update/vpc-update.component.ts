import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {NguCarouselConfig} from "@ngu/carousel";
import {OfferItem} from "../../instances/instances.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {InstancesService} from "../../instances/instances.service";
import {Router} from "@angular/router";
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {getCurrentRegionAndProject} from "@shared";
import {finalize} from "rxjs/operators";
import {RegionModel} from "../../../shared/models/region.model";
import {slider} from "../../../../../../../libs/common-utils/src";

@Component({
  selector: 'one-portal-vpc-update',
  templateUrl: './vpc-update.component.html',
  styleUrls: ['./vpc-update.component.less'],
  animations: [slider],
})
export class VpcUpdateComponent {
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
    {label: "Chọn đi" , value: "0"},
    {label: "Chọn đi nhé" , value: "1"},
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
    name: new FormControl('', {validators: [Validators.required]}),
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
    let ip = this.form.controls['ipConnectInternet'].value;
    let numOfMonth = this.form.controls['numOfMonth'].value;
    let ipType = this.form.controls['ipType'].value;
    let vCPU = this.form.controls['vCPU'].value;
    let ram = this.form.controls['ram'].value;

    if (ip != '') {
      if ((this.selectIndexTab == 0 && ipType != '') || (this.selectIndexTab == 1 && vCPU != 0 && ram != 0)) {
        this.loadingCalculate = true;
        const requestBody =
          {
            newQuotavCpu: vCPU,
            newQuotaRamInGb: ram,
            newQuotaHddInGb: this.form.controls['hhd'].value,
            newQuotaSsdInGb: this.form.controls['ssd'].value,
            newQuotaBackupVolumeInGb: this.numberBackup,
            newQuotaSecurityGroupCount: this.numberSecurityGroup,
            newQuotaKeypairCount: 1,// file system
            newQuotaVolumeSnapshotCount: 2,// file system snapshot .... IPSubnet,IpType
            newQuotaIpPublicCount: this.numberIpPublic,
            newQuotaIpFloatingCount: this.numberIpFloating,
            newQuotaNetworkCount: this.numberNetwork,
            newQuotaRouterCount: this.numberRouter,
            newQuotaLoadBalancerSdnCount: this.numberLoadBalancer,
            newLoadBalancerOfferId: 149, //X
            newQuotaShareInGb: 10,//X
            newQuotaShareSnapshotInGb: 3,//X
            newQuotaIpv6Count: this.numberIpv6,
            typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
            serviceType: 12,//X
            serviceInstanceId: 4439,//X
            customerId: this.tokenService.get()?.userId, //X
            newOfferId: 123,//X
            actionType: 4,//X
            regionId: this.regionId,  //V
            serviceName: "vpc669-tung19023"
          }
        const request = {
          orderItems: [
            {
              orderItemQuantity: 1,
              specificationString: JSON.stringify(requestBody),
              specificationType: "vpc_resize",
              sortItem: 0
              // serviceDuration: this.form.controls['numOfMonth'].value
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
  }

  initFlavors(): void {
    this.instancesService
      .getListOffers(this.regionId, 'vpc')
      .subscribe((data: any) => {
        this.listOfferFlavors = data.filter(
          (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
        );

        this.listOfferFlavors.forEach((e: OfferItem) => {
          e.description = '';
          e.characteristicValues.forEach((ch) => {
            if (ch.charName == 'cpu') {
              e.description += ch.charOptionValues[2] + ' VCPU / ';
            }
            if (ch.charName == 'ram') {
              e.description += ch.charOptionValues[2] + ' GB RAM / ';
            }
            if (ch.charName == 'hdd') {
              e.description += ch.charOptionValues[2] + ' GB RAM / ';
            }
            if (ch.charName == 'ip') {
              e.description += ch.charOptionValues[2] + ' IP ';
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

  openIpSubnet(param) {
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
