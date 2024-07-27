import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NguCarouselConfig } from "@ngu/carousel";
import { getCurrentRegionAndProject } from "@shared";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { slider } from "../../../../../../../libs/common-utils/src";
import { VpcModel } from "../../../shared/models/vpc.model";
import { IpPublicService } from "../../../shared/services/ip-public.service";
import { VpcService } from "../../../shared/services/vpc.service";
import { OfferItem } from "../../instances/instances.model";
import { InstancesService } from "../../instances/instances.service";

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

  data: VpcModel;
  regionId: any;
  loadingCalculate = false;
  dateNow: any;
  today: any;
  expiredDate: any;
  selectedDescription: string = '';
  selectedNameFlavor: string = '';

  keySSDOld: boolean = false;

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

  isLoading = false;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }


  form = new FormGroup({
    name: new FormControl({ value: 'loading data....', disabled: false }, { validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/),] }),
    description: new FormControl({ value: 'loading data....', disabled: false }),
    numOfMonth: new FormControl({ value: 1, disabled: true }, { validators: [Validators.required] }),
  });
  private readonly debounceTimeMs = 500;
  private inputChangeSubject = new Subject<{ value: number, name: string }>();
  disisable = true;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ipService: IpPublicService,
    private activatedRoute: ActivatedRoute,
    private vpc: VpcService,
    private notification: NzNotificationService,
    private orderService: OrderService,
    private catalogService: CatalogService
  ) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.loadData();
    this.iconToggle = "icon_circle_minus";
    // this.calculateReal();
    this.initFlavors();
    this.dateNow = new Date();
    this.calculate()
  }


  calculate() {
    this.searchSubject.next('');
  }

  onChangeConfigCustom() {

  }

  onInputFlavors(event: any, name: any) {
    this.selectPackge = name;
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === event
    );
    this.selectedElementFlavor = 'flavor_' + event;
    this.selectedNameFlavor = this.offerFlavor.offerName;
    console.log(this.selectedNameFlavor);
    
    console.log("selectedElementFlavor", this.selectedElementFlavor);

    if (this.offerFlavor?.description) {
      this.selectedDescription = this.offerFlavor.description.replace(/<\/?b>/g, '');
    } else {
      this.selectedDescription = '';
    }
  
    this.calculate();
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
              });
              this.cdr.detectChanges();
            });
        }
      );
  }



  onChangeTime() {
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() + Number(this.form.controls['numOfMonth'].value));
    this.expiredDate = dateNow;
  }

  // getDetailTest
  private loadData() {
  }


  onInputChange(value: number, name: string): void {
    this.inputChangeSubject.next({ value, name });
  }
}