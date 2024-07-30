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
import { OfferItem } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { WafDetailDTO } from '../waf.model';

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

  regionId: any;
  loadingCalculate = false;
  dateNow: any;
  today: any;
  expiredDate: any;
  selectedDescription: string = '';
  selectedNameFlavor: string = '';

  id: any;
  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;
  selectPackge = '';
  private searchSubject = new Subject<string>();
  selectIndexTab: number = 0;
  iconToggle: string;

  listTypeCatelogOffer: any;
  disableIpConnectInternet: boolean = true;
  loadingIpConnectInternet: boolean = true;
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
    private orderService: OrderService,
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

    this.calculate();
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
                e.characteristicValues.forEach((ch) => {
                  if (ch.charName == 'Domain') {
                    e.description += `<b>${ch.charOptionValues}</b> Domain`;
                  }
                });
                e.characteristicValues.forEach((ch) => {
                  if (
                    ch.charName == 'DDOS' &&
                    ch.charOptionValues[0] == 'true'
                  ) {
                    e.description += `<br/><b>Có</b> chống tấn công DDOS`;
                  } else if (
                    ch.charName == 'WAF' &&
                    ch.charOptionValues[0] == 'true'
                  ) {
                    e.description += `<br/><b>Có</b> tường lửa (WAF) chặn tấn công Top 10 OWASP`;
                  } else if (
                    ch.charName == 'IP/GeoBlock' &&
                    ch.charOptionValues[0] == 'true'
                  ) {
                    e.description += `<br/><b>Có</b> giới hạn truy cập theo IP, dải IP...`;
                  } else if (ch.charName == 'UsageTraffic') {
                    e.description += `<br/><b>${ch.charOptionValues} GB</b> Lưu lượng sử dụng`;
                  }
                });
              });
            } else {
              // Handle case where currentOffer is not found
              console.error('Current offer not found');
            }

            console.log(this.listOfferFlavors);
            this.cdr.detectChanges();
          });
      });
  }

  onChangeTime() {
    const dateNow = new Date();
    dateNow.setMonth(
      dateNow.getMonth() + Number(this.form.controls['numOfMonth'].value)
    );
    this.expiredDate = dateNow;
  }

  onInputChange(value: number, name: string): void {
    this.inputChangeSubject.next({ value, name });
  }
}
