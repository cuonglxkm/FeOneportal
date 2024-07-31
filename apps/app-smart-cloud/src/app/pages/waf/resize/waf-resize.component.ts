import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NguCarouselConfig } from '@ngu/carousel';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { WafService } from 'src/app/shared/services/waf.service';
import { slider } from '../../../../../../../libs/common-utils/src';
import { DataPayment, ItemPayment, OfferItem } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { WafDetailDTO, WAFResize } from '../waf.model';
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { OrderItemObject } from 'src/app/shared/models/price';

@Component({
  selector: 'one-portal-waf-resize',
  templateUrl: './waf-resize.component.html',
  styleUrls: ['./waf-resize.component.less'],
  animations: [slider],
})
export class WAFResizeComponent implements OnInit {
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 2, lg: 4, all: 0 },
    speed: 250,
    point: {
      visible: true,
    },
    touch: true,
    loop: true,
    animation: 'lazy',
  };

  listOfferFlavors: OfferItem[] = [];
  offerFlavor: OfferItem;
  selectedElementFlavor: any;

  dateNow: any;
  today: any;
  expiredDate: any;
  selectedDescription: string = '';
  selectedConfig: string = '';
  selectedNameFlavor: string = '';

  id: any;
  total: any;
  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  totalVAT = 0;
  selectPackge = '';
  private searchSubject = new Subject<string>();
  selectedOfferId: number = 0;
  currentOffer: any;
  isLoading = false;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  isSelectFlavor = false
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  form = new FormGroup({
    numOfMonth: new FormControl(
      { value: 1, disabled: true },
      { validators: [Validators.required] }
    ),
  });
  private inputChangeSubject = new Subject<{ value: number; name: string }>();
  disisable = true;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private service: WafService,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private orderService: ObjectStorageService,
    private catalogService: CatalogService
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getWAFById(this.id);
    this.initFlavors();
    this.dateNow = new Date();
    this.calculate();
  }

  calculate() {
    this.searchSubject.next('');
  }

  WAFDetail: WafDetailDTO = new WafDetailDTO();

  getWAFById(id) {
    this.service.getDetail(id).subscribe(
      (data) => {
        this.WAFDetail = data;
      },
      (error) => {
        this.WAFDetail = null;
      }
    );
  }

  onInputFlavors(event: any, name: any) {
    this.isSelectFlavor = true
    this.selectPackge = name;
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === event
    );
    this.selectedElementFlavor = 'flavor_' + event;
    this.selectedNameFlavor = this.offerFlavor.offerName;
    this.selectedOfferId = this.offerFlavor.id;
    console.log(this.selectedNameFlavor);

    console.log('selectedElementFlavor', this.selectedElementFlavor);

    if (this.offerFlavor?.description) {
      this.selectedDescription = this.offerFlavor.description.replace(
        /<\/?b>/g,
        ''
      );
    } else {
      this.selectedDescription = '';
    }

    if (this.offerFlavor?.config) {
      this.selectedConfig = this.offerFlavor.config;
    } else {
      this.selectedConfig = '';
    }

    this.getTotalAmount();
  }

  initFlavors(): void {
    this.instancesService
      .getDetailProductByUniqueName('waf')
      .subscribe((data) => {
        this.instancesService
          .getListOffersByProductIdNoRegion(data[0].id)
          .subscribe((data: any) => {
            this.listOfferFlavors = data.filter(
              (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
            );

            this.currentOffer = this.listOfferFlavors.find(
              (e) => e.id === this.WAFDetail.offerId
            );

            if (this.currentOffer) {
              const currentOfferPrice = this.currentOffer.price.fixedPrice.amount;
              this.currentOffer.description = '';
              this.currentOffer.config = '';
              this.currentOffer.characteristicValues.forEach((ch) => {
                if (ch.charName == 'Domain') {
                  this.currentOffer.description += `${ch.charOptionValues} Domain`;
                  this.currentOffer.config += `${ch.charOptionValues} Domain`;
                }
              });
              this.currentOffer.characteristicValues.forEach((ch) => {
                if (ch.charName == 'DDOS' && ch.charOptionValues[0] == 'true') {
                  this.currentOffer.description += `<br/>Có chống tấn công DDOS`;
                  this.currentOffer.config += `, Có chống tấn công DDOS`;
                } else if (
                  ch.charName == 'WAF' &&
                  ch.charOptionValues[0] == 'true'
                ) {
                  this.currentOffer.description += `<br/>Có tường lửa (WAF) chặn tấn công Top 10 OWASP`;
                  this.currentOffer.config += `, Có tường lửa (WAF) chặn tấn công Top 10 OWASP`;
                } else if (
                  ch.charName == 'IP/GeoBlock' &&
                  ch.charOptionValues[0] == 'true'
                ) {
                  this.currentOffer.description += `<br/>Có giới hạn truy cập theo IP, dải IP...`;
                  this.currentOffer.config += `, Có giới hạn truy cập theo IP, dải IP...`;
                } else if (ch.charName == 'UsageTraffic') {
                  this.currentOffer.description += `<br/>${ch.charOptionValues} GB Lưu lượng sử dụng`;
                  this.currentOffer.config += `, ${ch.charOptionValues} GB Lưu lượng sử dụng`;
                }
              });
              this.listOfferFlavors = this.listOfferFlavors.filter(
                (e) => e.price.fixedPrice.amount > currentOfferPrice
              );

              this.listOfferFlavors.forEach((e: OfferItem) => {
                e.description = '';
                e.config = ''
                e.characteristicValues.forEach((ch) => {
                  if (ch.charName == 'Domain') {
                    e.description += `<b>${ch.charOptionValues}</b> Domain`;
                    e.config += `${ch.charOptionValues} Domain`;
                  }
                });
                e.characteristicValues.forEach((ch) => {
                  if (
                    ch.charName == 'DDOS' &&
                    ch.charOptionValues[0] == 'true'
                  ) {
                    e.description += `<br/><b>Có</b> chống tấn công DDOS`;
                    e.config += `, Có chống tấn công DDOS`;
                  } else if (
                    ch.charName == 'WAF' &&
                    ch.charOptionValues[0] == 'true'
                  ) {
                    e.description += `<br/><b>Có</b> tường lửa (WAF) chặn tấn công Top 10 OWASP`;
                    e.config += `, tường lửa (WAF) chặn tấn công Top 10 OWASP`;
                  } else if (
                    ch.charName == 'IP/GeoBlock' &&
                    ch.charOptionValues[0] == 'true'
                  ) {
                    e.description += `<br/><b>Có</b> giới hạn truy cập theo IP, dải IP...`;
                    e.config += `, Có giới hạn truy cập theo IP, dải IP...`;
                  } else if (ch.charName == 'UsageTraffic') {
                    e.description += `<br/><b>${ch.charOptionValues} GB</b> Lưu lượng sử dụng`;
                    e.config += `, ${ch.charOptionValues} GB Lưu lượng sử dụng`;
                  }
                });
              });
            } else {
              console.error('Current offer not found');
            }
            this.cdr.detectChanges();
          });
      });
  }

  WAFResize: WAFResize = new WAFResize();
  initWAFResize() {
    this.WAFResize.customerId = this.tokenService.get()?.userId;
    this.WAFResize.userEmail = this.tokenService.get()?.email;
    this.WAFResize.actorEmail = this.tokenService.get()?.email;
    this.WAFResize.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.Waf.WafReizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.WAFResize.regionId = 0;
    this.WAFResize.serviceType = ServiceType.WAF;
    this.WAFResize.actionType = ServiceActionType.RESIZE;
    this.WAFResize.serviceInstanceId = this.id;
    this.WAFResize.newOfferId = this.selectedOfferId;
  }

  orderObject: OrderItemObject = new OrderItemObject();

  getTotalAmount() {
    this.initWAFResize();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(
      this.WAFResize
    );
    itemPayment.specificationType = 'waf_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    this.orderService.getTotalAmount(dataPayment).subscribe((result) => {
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
    this.inputChangeSubject.next({ value, name });
  }
}
