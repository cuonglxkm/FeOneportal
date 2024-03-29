import { Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { addDays } from 'date-fns';
import { DataPayment, ItemPayment } from 'src/app/pages/instances/instances.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { OrderService } from 'src/app/shared/services/order.service';

@Component({
  selector: 'one-portal-vpn-s2s-create',
  templateUrl: './vpn-s2s-create.component.html',
  styleUrls: ['./vpn-s2s-create.component.less'],
})
export class VpnS2sCreateComponent implements OnInit {
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
  /**
   *
   */
  constructor(
    private catalogService: CatalogService,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private orderService: OrderService
  ) {
    this.unitOfMeasure = environment.unitOfMeasureVpn;
  }

  ngOnInit() {
    this.numberMonth = 1;
  }

  ngAfterContentInit(){
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
      .getCatalogOffer(null, this.region, this.unitOfMeasure).pipe()
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
        }
        this.loading = false;
      });
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
      this.totalAmount = this.offer['Price'] * this.numberMonth;
      this.totalincludesVAT = this.totalAmount * (this.vatNumber + 1);
      this.isEnable = true;
      this.specChange();
      this.priceChange();
    }
    
  }

  caculator(event) {
    if(this.offer){
      this.totalAmount = this.offer['Price'] * this.numberMonth;
      this.totalincludesVAT = this.totalAmount * (this.vatNumber + 1);
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
          specificationType: "vpnsitetosite_create",
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
    itemPayment.specificationType = 'vpnsitetosite_create';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = 0;
    if(!this.vatNumber){
      this.orderService.getTotalAmount(dataPayment).subscribe((result) => {
        if(result && result.data && result.data.currentVAT){
          this.vatNumber = result.data.currentVAT;
          this.vatPer = this.vatNumber * 100;
        }
      });
    }
    
  }

  specChange() {
    this.spec = {
      "offerName": this.offer['OfferName'],
      "bandwidth": this.offer['Bandwidth'],
      "customerId": this.tokenService.get()?.userId,
      "userEmail": null,
      "actorEmail": null,
      "vpcId": this.project,
      "regionId": this.region,
      "serviceName": null,
      "serviceType": 20,
      "actionType": 0,
      "serviceInstanceId": 0,
      "createDate": this.dateString,
      "expireDate": this.expiredDate,
      "createDateInContract": null,
      "saleDept": null,
      "saleDeptCode": null,
      "contactPersonEmail": null,
      "contactPersonPhone": null,
      "contactPersonName": null,
      "am": null,
      "amManager": null,
      "note": null,
      "isTrial": false,
      "offerId": this.offer['Id'],
      "couponCode": null,
      "dhsxkd_SubscriptionId": null,
      "dSubscriptionNumber": null,
      "dSubscriptionType": null,
      "oneSMEAddonId": null,
      "oneSME_SubscriptionId": null,
      "typeName": "SharedKernel.IntegrationEvents.Orders.Specifications.VpnSiteToSiteCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"
    };
  }
}
