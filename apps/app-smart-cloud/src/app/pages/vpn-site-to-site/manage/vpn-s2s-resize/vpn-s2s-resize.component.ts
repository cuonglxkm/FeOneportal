import { Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { addDays } from 'date-fns';
import { DataPayment, ItemPayment } from 'src/app/pages/instances/instances.model';
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';

@Component({
  selector: 'one-portal-vpn-s2s-resize',
  templateUrl: './vpn-s2s-resize.component.html',
  styleUrls: ['./vpn-s2s-resize.component.less'],
})
export class VpnS2sResizeComponent implements OnInit{
  vpcId = 0;
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  numberMonth: number = 1;
  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  unitOfMeasure: string = "";
  offerDatas: any;
  loading = false;
  offer: any;
  dateString = new Date();
  expiredDate: Date = addDays(this.dateString, 30);
  isEnable = false;
  spec: any;
  vatNumber = 0;
  vatPer = 10;
  vpn: any;
  oldOfferId = 0;
  /**
   *
   */
  constructor(
    private catalogService: CatalogService,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private vpnSiteToSiteService: VpnSiteToSiteService,
  ) {
    this.unitOfMeasure = environment.unitOfMeasureVpn;
  }
  ngOnInit(): void {
    this.vpcId = Number(this.activatedRoute.snapshot.paramMap.get('vpcId'));
    this.numberMonth = 1;
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;

  }

  getOffers(){
    // this.offerDatas = [];
    this.loading = true;
    this.catalogService
      .getCatalogOffer(null, this.region, this.unitOfMeasure, null).pipe()
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.offerDatas = [];
          data.forEach(item => {
            let bandwidth = item['characteristicValues'].find(x => x['charName'] == 'Bandwidth');
            this.offerDatas.push({
              'Id': item['id'],
              'OfferName': item['offerName'],
              'Bandwidth': bandwidth['charOptionValues'][0],
              'Price': item['price']['fixedPrice']['amount'],
            });
          });
          this.getOffer();
        }
        this.loading = false;
      });
  }

  caculator(event) {
    if(this.offer){
      this.totalAmount = this.offer['Price'] * this.numberMonth;
      this.totalincludesVAT = this.totalAmount * ((this.vatNumber ? this.vatNumber : 0.1) + 1);
      this.specChange();
      this.priceChange();
    }
    this.expiredDate = addDays(this.dateString, 30 * this.numberMonth);
  }

  extend() {
    
    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: "Tạo VPN site to site",
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.spec),
          specificationType: "vpnsitetosite_resize",
          price: this.totalAmount,
          serviceDuration: this.numberMonth
        }
      ]
    }

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
  }

  priceChange(){
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.spec);
    itemPayment.specificationType = 'vpnsitetosite_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = 0;
    this.orderService.getTotalAmount(dataPayment).subscribe((result) => {
      if(result && result.data && result.data.totalAmount && result.data.totalPayment){
        this.vatNumber = result.data.currentVAT;
        this.vatPer = this.vatNumber * 100;
        this.totalAmount = result.data.totalAmount.amount > 0 ? result.data.totalAmount.amount : 0;
        this.totalincludesVAT = result.data.totalPayment.amount > 0 ? result.data.totalPayment.amount : 0;
        if(this.totalincludesVAT > 0){
          this.isEnable = true;
        } else {
          this.isEnable = false;
        }
      }
    });
  }

  specChange() {
    this.spec = {
      "offerName": this.offer['OfferName'],
      "bandwidth": this.offer['Bandwidth'],
      "offerId": this.oldOfferId,
      "newOfferId": this.offer['Id'],
      "serviceType": ServiceType.VPNSiteToSites,
      "actionType": ServiceActionType.RESIZE,
      "serviceInstanceId": this.vpn['id'],
      "regionId": this.region,
      "serviceName": null,
      "customerId": this.tokenService.get()?.userId,
      "vpcId": this.project,
      "typeName": "SharedKernel.IntegrationEvents.Orders.Specifications.VpnSiteToSiteResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
      "userEmail": null,
      "actorEmail": null
    };
  }

  getOffer(){
    this.loading = true;
    this.vpnSiteToSiteService.getVpnSiteToSite(this.vpcId).pipe().subscribe(data => {
      this.loading = false;
      if(data){
        this.vpn = data;
        this.dateString = new Date(this.vpn['createdDate']);
        this.expiredDate = new Date(this.vpn['expiredDate']);
        this.numberMonth = Math.round((this.expiredDate.getTime() - this.dateString.getTime())/86400000/30);
        this.offer = this.offerDatas.find(x => x['OfferName'] == data['offerName'] && x['Bandwidth'] == data['bandwidth']);
        if(this.offer){
          this.oldOfferId = this.offer['Id'];
          let element = this.el.nativeElement.querySelector(`#offer-title-${this.offer['Id']}`);
          this.renderer.addClass(element.parentNode, 'tr-selected');
          this.specChange();
          this.priceChange();
        }
      }
    }, error => {
      this.loading = false;
    })
  }

  selectOffer(e, data){
    if(!this.offer || data['Id'] != this.offer['Id']){
      this.offer = data;
      let element = this.el.nativeElement.querySelector(`#offer-title-${this.offer['Id']}`);
      let listTr = element.parentNode.parentNode.children;
      for (let elementTr of listTr) {
        this.renderer.removeClass(elementTr, 'tr-selected');

      }
      this.renderer.addClass(element.parentNode, 'tr-selected');
      if(this.offer['Id'] != this.oldOfferId){
        this.isEnable = true;
      } else {
        this.isEnable = false;
      }
      this.specChange();
      this.priceChange();
    }
  }
}
