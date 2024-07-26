import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NguCarouselConfig } from '@ngu/carousel';
import { ImageTypesModel, OfferItem } from '../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { InstancesService } from '../../instances/instances.service';
import { getCurrentRegionAndProject } from '@shared';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { duplicateDomainValidator, ipValidatorMany, RegionModel, slider } from '../../../../../../../libs/common-utils/src';
import { IpPublicService } from '../../../shared/services/ip-public.service';
import { OfferDetail, SupportService } from '../../../shared/models/catalog.model';
import { da } from 'date-fns/locale';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject } from 'rxjs';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { Interface } from 'readline';
import { VpcService } from 'src/app/shared/services/vpc.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { LoadingService } from '@delon/abc/loading';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { DOMAIN_REGEX } from 'src/app/shared/constants/constants';
import { DomSanitizer } from '@angular/platform-browser';




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
  iconToggle: string;

  listOfferFlavors: OfferItem[] = [];
  offerFlavor: OfferItem;
  selectedElementFlavor: any;
  regionId: any;
  loadingCalculate = false;
  today = new Date();
  expiredDate = new Date();

  numOfMonth: number;
  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;

  prices: any;

  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;

  selectedDescription: string = '';
  listOfDomain: any = [];

  isRequired: boolean = true;

  isLoading = false;
  isVisibleCreateSSLCert = false;
 
  openModalSSlCert(){
    this.isVisibleCreateSSLCert = true
  }
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];

  policy: string
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  productByRegion: any

  form: FormGroup = this.fb.group({
    nameWAF: ['', [Validators.required]],
    bonusServices: this.fb.array([this.createBonusService()])
  });
  private inputChangeSubject = new Subject<{ value: number, name: string }>();

  private searchSubject = new Subject<string>();

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    private catalogService: CatalogService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private ipService: IpPublicService,
    private vpc: VpcService,
    private orderService: OrderService,
    private loadingSrv: LoadingService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer

  ) {
  
  }
  
  url = window.location.pathname;
  hasRoleSI: boolean
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
    this.initFlavors();;
    // this.onChangeTime();
    this.getStepBlock('BLOCKSTORAGE')
    this.iconToggle = "icon_circle_minus"
    // this.numOfMonth = this.form.controls['numOfMonth'].value;

  }

  get bonusServices(): FormArray {
    return this.form.get('bonusServices') as FormArray;
  }

  createBonusService(): FormGroup {
    return this.fb.group({
      nameWAF: ['', [Validators.required]],
      domain: ['', [Validators.required,Validators.pattern(DOMAIN_REGEX) ,duplicateDomainValidator]],
      ipPublic: ['', [Validators.required, ipValidatorMany]],
      host: [''],
      port: [''],
      sslCert: ['']
    });
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




  handleSubmit(){
    const nameWAFValue = this.form.get('nameWAF')?.value;
    const domainValues = this.bonusServices.controls.map(group => group.get('ipPublic')?.value);
    console.log('Domains:', domainValues);
  }

  getDomainValues(): string {
    return this.bonusServices.controls
      .map(control => control.get('domain')?.value)
      .filter(value => value)
      .join(', ');
  }

  onChangeTime(numberMonth: number) {

    this.numOfMonth = numberMonth;
    console.log("numOfMonth123", this.numOfMonth)
    // const dateNow = new Date();
    // dateNow.setDate(dateNow.getDate() + Number(this.form.controls['numOfMonth'].value * 30));
    // console.log("this.numOfMonth hh",this.numOfMonth)
    // this.expiredDate = dateNow;
    this.calculate(null);
  }

  calculate(number: any) {
    if (this.vpcType === '0') {
      this.activeVpc = false;
      this.activeNoneVpc = true;
    } else {
      this.activeVpc = true;
      this.activeNoneVpc = false;

    }
    this.searchSubject.next('');

  }
  getStepBlock(name: string) {
    this.vpc.getStepBlock(name).subscribe((res: any) => {
      const valuestring: any = res.valueString;
      const parts = valuestring.split("#")
      this.minBlock = parseInt(parts[0]);
      this.stepBlock = parseInt(parts[1]);
      this.maxBlock = parseInt(parts[2]);
    })
  }
  messageNotification: string;

  onInputChange(value: number, name: string): void {
    console.log("object value", value)
    this.inputChangeSubject.next({ value, name });
  }



  selectPackge = '';
  vpcType = '0';
  activeNoneVpc = true;
  activeVpc = false;

  onInputFlavors(event: any, name: any) {
    this.selectPackge = name;
    this.offerFlavor = this.listOfferFlavors.find(
      (flavor) => flavor.id === event
    );
    this.selectedElementFlavor = 'flavor_' + event;
    console.log("selectedElementFlavor", this.selectedElementFlavor);

    if (this.offerFlavor?.description) {
      this.selectedDescription = this.offerFlavor.description.replace(/<\/?b>/g, '');
    } else {
      this.selectedDescription = '';
    }
  
    this.calculate(null);
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

              console.log("listOfferFlavors", this.listOfferFlavors);
              

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

  handleCancelCreateSSLCert(){
    this.isVisibleCreateSSLCert = false
  }

}
