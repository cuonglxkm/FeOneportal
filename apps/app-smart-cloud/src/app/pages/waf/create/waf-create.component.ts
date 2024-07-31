import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NguCarouselConfig } from '@ngu/carousel';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { DOMAIN_REGEX } from 'src/app/shared/constants/constants';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { VpcService } from 'src/app/shared/services/vpc.service';
import { duplicateDomainValidator, ipValidatorMany, slider } from '../../../../../../../libs/common-utils/src';
import { IpPublicService } from '../../../shared/services/ip-public.service';
import { DataPayment, ItemPayment, OfferItem, Order, OrderItem } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { ObjectStorageCreate } from 'src/app/shared/models/object-storage.model';
import { WAFCreate } from '../../../shared/models/waf-init';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { OrderItemObject } from 'src/app/shared/models/price';




@Component({
  selector: 'one-portal-waf-create',
  templateUrl: './waf-create.component.html',
  styleUrls: ['./waf-create.component.less'],
  animations: [slider]
})





export class WAFCreateComponent implements OnInit {
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 2, md: 3, lg: 4, all: 0 },
    speed: 250,
    point: {
      visible: true
    },
    touch: true,
    loop: true,
    animation: 'lazy'
  };

  listOfferFlavors: OfferItem[] = [];
  offerFlavor: OfferItem;
  selectedElementFlavor: any;
  regionId: any;
  today = new Date();
  expiredDate = new Date();

  numOfMonth: number;
  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;

  selectedDescription: string = '';
  selectedNameFlavor: string = '';
  selectedOfferId: number = 0;
  listOfDomain: any = [];

  isRequired: boolean = true;

  isLoading = false;
  isVisibleCreateSSLCert = false;
  WAFCreate: WAFCreate = new WAFCreate();
  totalincludesVAT: number = 0;
  url = window.location.pathname;
 
  openModalSSlCert(){
    this.isVisibleCreateSSLCert = true
  }
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  timeSelected: any
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  productByRegion: any

  policy = [
    { label: 'Default', value: '0' },
  ];

  policySelected: string = '0';
  numberDomain: number = 0;
  get policySelectedLabel(): string {
    const selectedPolicy = this.policy.find(p => p.value === this.policySelected);
    return selectedPolicy ? selectedPolicy.label : '';
  }

    form: FormGroup = this.fb.group({
      nameWAF: ['', [Validators.required]],
      bonusServices: this.fb.array([this.createBonusService()]),
      time: [1]
    });
  private inputChangeSubject = new Subject<{ value: number, name: string }>();

  private searchSubject = new Subject<string>();
  orderObject: OrderItemObject = new OrderItemObject();
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private orderService: OrderService,
    private loadingSrv: LoadingService,
    private fb: FormBuilder,
    private service: ObjectStorageService

  ) {
  
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.regionId = RegionID.NORMAL;
      } else {
        this.regionId = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.regionId = RegionID.ADVANCE;
    }
    this.initFlavors();
  }

  get bonusServices(): FormArray {
    return this.form.get('bonusServices') as FormArray;
  }

  createBonusService(): FormGroup {
    return this.fb.group({
      domain: ['', [Validators.required,Validators.pattern(DOMAIN_REGEX) ,duplicateDomainValidator]],
      ipPublic: ['', [Validators.required, ipValidatorMany]],
      host: [''],
      port: [0],
      sslCert: ['']
    });
  }

  areAllDomainsValid(): boolean {
    return this.bonusServices.controls.every(control => control.get('domain')?.valid);
  }

  initWAF() {
    this.WAFCreate.customerId = this.tokenService.get()?.userId;
    this.WAFCreate.userEmail = this.tokenService.get()?.email;
    this.WAFCreate.actorEmail = this.tokenService.get()?.email;
    this.WAFCreate.projectId = null;
    this.WAFCreate.regionId = 0;
    this.WAFCreate.serviceType = 0;
    this.WAFCreate.actionType = 0;
    this.WAFCreate.serviceInstanceId = 0;
    this.WAFCreate.createDate = this.today
    this.WAFCreate.expireDate = this.expiredDate
    this.WAFCreate.offerId = this.selectedOfferId;
    this.WAFCreate.policyId = this.policySelected;
    this.WAFCreate.wafDomains = this.form.get('bonusServices')?.value
    this.WAFCreate.serviceName = this.form.get('nameWAF')?.value
    this.WAFCreate.isSendMail = true
    this.WAFCreate.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.Waf.WafCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"
  }


  addBonusService() {
    this.bonusServices.push(this.createBonusService());
  }

  removeBonusService(index: number) {
    if (this.bonusServices.length === 1) {
      this.bonusServices.at(0).reset();
    } else {
      this.bonusServices.removeAt(index);
    }
  }


  getDomainValues(): string {
    return this.bonusServices.controls
      .map(control => control.get('domain')?.value)
      .filter(value => value)
      .join(', ');
  }

  onChangeTime(numberMonth: number) {
    this.timeSelected = numberMonth;
    this.form.controls.time.setValue(this.timeSelected);
    this.getTotalAmount();
  }


  getTotalAmount() {
    this.initWAF();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.WAFCreate);
    itemPayment.specificationType = 'waf_create';
    itemPayment.serviceDuration = this.form.controls.time.value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    this.service.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.orderObject = result.data;
      this.cdr.detectChanges();
    });
  }

  onInputChange(value: number, name: string): void {
    console.log("object value", value)
    this.inputChangeSubject.next({ value, name });
  }



  selectPackge = '';

  getNumberOfDomains(characteristicValues: any[]): number {
    const domainCharacteristic = characteristicValues.find(ch => ch.charName === 'Domain');
    if (domainCharacteristic && domainCharacteristic.charOptionValues) {
      return parseInt(domainCharacteristic.charOptionValues[0], 10);
    }
    return 0;
  }

  isShowAddButton(): boolean {
    return this.bonusServices.length < this.numberDomain;
  }

  onInputFlavors(event: any, name: any) {
    this.selectPackge = name;
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === event
    );
    this.selectedElementFlavor = 'flavor_' + event;
    this.selectedNameFlavor = this.offerFlavor.offerName;
    this.selectedOfferId = this.offerFlavor.id;
    console.log(this.selectedNameFlavor);
    
    console.log("selectedElementFlavor", this.selectedElementFlavor);
    this.numberDomain = this.offerFlavor?.numberDomain || 0; 
    console.log(this.numberDomain);
    
    if (this.offerFlavor?.description) {
      this.selectedDescription = this.offerFlavor.description.replace(/<\/?b>/g, '');
    } else {
      this.selectedDescription = '';
    }
  
    this.getTotalAmount();
  }



  initFlavors(): void {
    this.instancesService.getDetailProductByUniqueName('waf')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductIdNoRegion(data[0].id)
            .subscribe((data: any) => {
              this.listOfferFlavors = data.filter(
                (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
              );

            
              this.listOfferFlavors.forEach((e: OfferItem) => {
                e.description = '';
                e.characteristicValues.forEach((ch) => {
                  if (ch.charName == 'Domain') {
                    e.description += `<b>${ch.charOptionValues}</b> Domain`;
                  }
                });

                e.characteristicValues.forEach((ch) => {
                   if(ch.charName == 'DDOS' && ch.charOptionValues[0] == 'true'){
                    e.description += `<br/><b>Có</b> chống tấn công DDOS`
                  }else if(ch.charName == 'WAF' && ch.charOptionValues[0] == 'true'){
                    e.description += `<br/><b>Có</b> tường lửa (WAF) chặn tấn công Top 10 OWASP`
                   }else if(ch.charName == 'IP/GeoBlock' && ch.charOptionValues[0] == 'true'){
                    e.description += `<br/><b>Có</b> giới hạn truy cập theo IP, dải IP...`
                   }else if(ch.charName == 'UsageTraffic'){
                    e.description += `<br/><b>${ch.charOptionValues} GB</b> Lưu lượng sử dụng`
                   }
                });
                e.numberDomain = this.getNumberOfDomains(e.characteristicValues)
              });
              this.cdr.detectChanges();
            });
        }
      );
  }

  orderItem: OrderItem[] = [];
  order: Order = new Order();
  handleSubmit() {
    this.orderItem = [];
    this.initWAF();
    let specification = JSON.stringify(this.WAFCreate);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'waf_create';
    orderItemOS.price = this.totalAmount;
    orderItemOS.serviceDuration = this.form.controls.time.value;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'tạo waf';
    this.order.orderItems = this.orderItem;
    this.orderService.validaterOrder(this.order).subscribe({
      next: (data) => {
        if (data.success) {
          var returnPath: string = window.location.pathname;
          this.router.navigate(['/app-smart-cloud/order/cart'], {
            state: { data: this.order, path: returnPath },
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

  handleCancelCreateSSLCert(){
    this.isVisibleCreateSSLCert = false
  }

}
