import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { addDays } from 'date-fns';
import { DataPayment, ItemPayment } from 'src/app/pages/instances/instances.model';
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-vpn-s2s-resize',
  templateUrl: './vpn-s2s-resize.component.html',
  styleUrls: ['./vpn-s2s-resize.component.less'],
})
export class VpnS2sResizeComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  numberMonth: number = 1;
  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  unitOfMeasure: string = "";
  offerDatas: any;
  offerDatasClone: any;
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
  vatDisplay;
  currentOffer: any;
  today: Date = new Date();
  isVisiblePopupError: boolean = false;
  isLoadingAction: boolean = false;
  errorList: string[] = [];
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
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
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {
    this.unitOfMeasure = environment.unitOfMeasureVpn;
  }
  ngOnInit(): void {
    this.numberMonth = 1;
    this.getVpnAndOffers();
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;

  }

  userChangeProject(){
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  getVpnAndOffers() {
    this.loading = true;
    
    this.vpnSiteToSiteService.getVpnSiteToSite(0).pipe().subscribe(data => {
      this.loading = false;  
      if (data) {
        if(data.body.status === 'TAMNGUNG' || data.body.serviceStatus === 'TAMNGUNG'){
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            'VPN Site To Site đang ở trạng thái tạm ngưng. Không thể vào trang này'
          );
            this.router.navigateByUrl('/app-smart-cloud/vpn-site-to-site');
        }else{
          this.vpn = data.body;
          this.dateString = new Date(this.vpn['createdDate']);
          this.expiredDate = new Date(this.vpn['expiredDate']);
          this.numberMonth = Math.round((this.expiredDate.getTime() - this.dateString.getTime()) / 86400000 / 30);
          this.getOffers(); 
        }
      }
    }, error => {
      this.loading = false; 
      if (error.error.detail.includes('made requires authentication')|| error.error.detail.includes('could not be found')) {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          'Bản ghi không tồn tại'
        );
        this.router.navigateByUrl('/app-smart-cloud/vpn-site-to-site')
      }
    });
  }
  
  getOffers() {
    this.loading = true;
  
    if (this.vpn) {
      this.catalogService.getCatalogOffer(null, this.region, this.unitOfMeasure, null).pipe()
        .subscribe((data) => {
          if (data && data.length > 0) {
            this.offerDatas = [];
            this.offerDatasClone = [];
            this.currentOffer = data.find(
              (e) => e.offerName === this.vpn.offerName
            );
  
            if (this.currentOffer) {
              const currentOfferPrice = this.currentOffer.price.fixedPrice.amount;
              const cloneData = [...data]
              const filterOffers = cloneData.filter(
                (e) => e.price.fixedPrice.amount > currentOfferPrice
              );
  
              filterOffers.forEach(item => {
                let bandwidth = item['characteristicValues'].find(x => x['charName'] === 'Bandwidth');
                this.offerDatas.push({
                  'Id': item['id'],
                  'OfferName': item['offerName'],
                  'Bandwidth': bandwidth['charOptionValues'][0],
                  'Price': item['price']['fixedPrice']['amount'],
                });
              });

              data.forEach(item => {
                let bandwidth = item['characteristicValues'].find(x => x['charName'] === 'Bandwidth');
                this.offerDatasClone.push({
                  'Id': item['id'],
                  'OfferName': item['offerName'],
                  'Bandwidth': bandwidth['charOptionValues'][0],
                  'Price': item['price']['fixedPrice']['amount'],
                });
              });
              
              if (this.offer) {
                this.oldOfferId = this.offer['Id'];
                const element = this.el.nativeElement.querySelector(`#offer-title-${this.offer['Id']}`);
                
                if (element && element.parentNode) {
                  this.renderer.addClass(element.parentNode, 'tr-selected');
                } else {
                  console.error('Element or parentNode not found.');
                }
                
                this.specChange();
                this.priceChange();
              }
            }
          }
          this.loading = false;
        }, error => {
          this.loading = false;
        });
    } else {
      this.loading = false;
    }
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

  closePopupError() {
    this.isVisiblePopupError = false;
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

    this.orderService.validaterOrder(request).subscribe({
      next: (data) => {
        if (data.success) {
          var returnPath: string = window.location.pathname;
          this.router.navigate(['/app-smart-cloud/order/cart'], {
            state: { data: request, path: returnPath },
          });
        } else {
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
      },
      error: (e) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          e.error.detail
        );
      },
    });
  }

  priceChange(){
    this.isLoadingAction = true;
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
        this.isLoadingAction = false
        this.vatNumber = result.data.currentVAT;
        this.vatPer = this.vatNumber * 100;
        this.vatDisplay = result.data.totalVAT.amount;
        this.totalAmount = result.data.totalAmount.amount > 0 ? result.data.totalAmount.amount : 0;
        this.totalincludesVAT = result.data.totalPayment.amount > 0 ? result.data.totalPayment.amount : 0;
        if(this.totalincludesVAT > 0){
          this.isEnable = true;
        } else {
          this.isEnable = false;
        }
      }
    }, error => {
      this.isLoadingAction = false
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
