import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { addDays } from 'date-fns';
import { DataPayment, ItemPayment } from 'src/app/pages/instances/instances.model';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '../../../../../../../app-kafka/src/app/core/i18n/i18n.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
@Component({
  selector: 'one-portal-vpn-s2s-create',
  templateUrl: './vpn-s2s-create.component.html',
  styleUrls: ['./vpn-s2s-create.component.less'],
})
export class VpnS2sCreateComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
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
  vatDisplay
  timeSelected: any;
  isLoadingCreate: boolean = false;
  isVisiblePopupError: boolean = false;
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
    private orderService: OrderService,
    private fb: NonNullableFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService,
  ) {
    this.unitOfMeasure = environment.unitOfMeasureVpn;
  }

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [1]
  });

  ngOnInit() {
    this.numberMonth = 1;
  }

  ngAfterContentInit(){
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
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
            console.log(item);
            
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
      this.totalAmount = this.offer['Price'] * this.validateForm.controls.time.value
      this.totalincludesVAT = this.totalAmount * ((this.vatNumber ? this.vatNumber : 0.1) + 1);
      this.isEnable = true;
      this.specChange();
      this.priceChange();
    }
    
  }

  caculator(event) {
    if(this.offer){
      this.totalAmount = this.offer['Price'] * this.validateForm.controls.time.value
      this.totalincludesVAT = this.totalAmount * ((this.vatNumber ? this.vatNumber : 0.1) + 1);
      this.specChange();
      this.priceChange();
    }
    this.expiredDate = addDays(this.dateString, 30 * this.numberMonth);
  }

  extend() {
    this.specChange();
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
          serviceDuration: this.validateForm.controls.time.value
        }
      ]
    }
    this.isLoadingCreate = true;
    this.orderService.validaterOrder(request).subscribe({
      next: (data) => {
        if (data.success) {
          var returnPath: string = window.location.pathname;
          this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
        }else{
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
        this.isLoadingCreate = false;
      },
      error: (e) => {
        this.isLoadingCreate = false;
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            e.error.detail
          );
      },
    });

    
  }

  onChangeTime(value) {
    this.timeSelected = value;
    this.validateForm.controls.time.setValue(this.timeSelected);
    console.log(this.timeSelected);
    this.priceChange();
  }

  priceChange(){
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.spec);
    itemPayment.specificationType = 'vpnsitetosite_create';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.controls.time.value;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = 0;
      this.orderService.getTotalAmount(dataPayment).subscribe((result) => {
        if(result && result.data && result.data.currentVAT){
          this.vatNumber = result.data.currentVAT;
          this.vatDisplay = result.data.totalVAT.amount;
          this.vatPer = this.vatNumber * 100;
          this.totalincludesVAT = Number.parseFloat(result.data.totalPayment.amount);
          this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
        }
      });
    
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
      "serviceType": ServiceType.VPNSiteToSites,
      "actionType": ServiceActionType.CREATE,
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

  closePopupError() {
    this.isVisiblePopupError = false;
  }
}
