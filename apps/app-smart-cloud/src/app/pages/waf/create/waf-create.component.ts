import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NguCarouselConfig } from '@ngu/carousel';
import { ImageTypesModel, OfferItem } from '../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { InstancesService } from '../../instances/instances.service';
import { getCurrentRegionAndProject } from '@shared';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RegionModel, slider } from '../../../../../../../libs/common-utils/src';
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




@Component({
  selector: 'one-portal-waf-create',
  templateUrl: './waf-create.component.html',
  styleUrls: ['./waf-create.component.less'],
  animations: [slider]
})


export class WAFCreateComponent implements OnInit {
  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 2, lg: 3, all: 0 },
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
  listLoadbalancer: OfferDetail[] = [];
  listSiteToSite: OfferDetail[] = [];
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
  defaultDomain = { domain: '', ip: '', host: '', port: '', ssl: ''  };


  gpuQuotasGobal: { GpuOfferId: number, GpuCount: number, GpuType: string, GpuPrice: number, GpuPriceUnit: number }[] = [];


  prices: any;

  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;

  loadBalancerName: string;
  sitetositeName: string;
  listTypeCatelogOffer: any;
  listOfDomain: any = [];

  isRequired: boolean = true;

  isLoading = false;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  productByRegion: any

  isShowAlertGpu: boolean;
  form: FormGroup = this.fb.group({
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
    private fb: FormBuilder

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
    this.numOfMonth = this.form.controls['numOfMonth'].value;

  }
  offervCpu: number;


   get bonusServices(): FormArray {
    return this.form.get('bonusServices') as FormArray;
  }

  createBonusService(): FormGroup {
    return this.fb.group({
      domain: ['', [Validators.required]],
      ipPublic: ['', [Validators.required]],
      host: ['', [Validators.required]],
      port: ['', [Validators.required]],
      sslCert: ['', [Validators.required]]
    });
  }

  addBonusService() {
    const bonusService = this.fb.group({
      domain: ['', [Validators.required]],
      ipPublic: ['', [Validators.required]],
      host: ['', [Validators.required]],
      port: ['', [Validators.required]],
      sslCert: ['', [Validators.required]]
    });
    this.bonusServices.push(bonusService);
  }

  removeBonusService(index: number) {
    if (this.bonusServices.length === 1) {
      this.bonusServices.at(0).reset();
    } else {
      this.bonusServices.removeAt(index);
    }
  }

  handleSubmit(){
    const domainValues = this.bonusServices.controls.map(group => group.get('domain')?.value)
    console.log(domainValues);
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
    console.log("objeselectedElementFlavorct", this.selectedElementFlavor)
    this.calculate(null);
  }



  initFlavors(): void {
    this.instancesService.getDetailProductByUniqueName('vpc-oneportal')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductId(data[0].id, this.regionId)
            .subscribe((data: any) => {
              this.listOfferFlavors = data.filter(
                (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
              );

              this.listOfferFlavors.forEach((e: OfferItem) => {
                e.description = '0 vCPU / 0 GB RAM / HHH GB SSS / 0 IP';
                e.characteristicValues.forEach((ch) => {
                  if (ch.charName.toUpperCase() == 'CPU') {
                    e.description = e.description.replace(/0 vCPU/g, ch.charOptionValues[0] + ' vCPU');
                  } else if (ch.charName.toUpperCase() == 'RAM') {
                    e.description = e.description.replace(/0 GB RAM/g, ch.charOptionValues[0] + ' GB RAM');
                  } else if (ch.charName == 'Storage') {
                    e.description = e.description.replace(/HHH/g, ch.charOptionValues[0]);
                  } else if (ch.charName == 'VolumeType') {
                    e.description = e.description.replace(/SSS/g, ch.charOptionValues[0]);
                  } else if (ch.charName.toUpperCase() == 'IP') {
                    e.description = e.description.replace(/0 IP/g, ch.charOptionValues[0] + ' IP');

                    e.ipNumber = ch.charOptionValues[0];
                    console.log(" e.ipNumber", e.ipNumber)
                  }
                });
              });
              this.cdr.detectChanges();
            });
        }
      );
  }

}
