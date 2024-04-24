import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { camelizeKeys } from 'humps';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { KafkaUpgradeReq } from 'src/app/core/models/kafka-create-req.model';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';
import { OfferKafka } from 'src/app/core/models/offer.model';
import { Order, OrderItem } from 'src/app/core/models/order.model';
import { ServicePack } from 'src/app/core/models/service-pack.model';
import { KafkaService } from 'src/app/services/kafka.service';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'one-portal-upgrade-kafka',
  templateUrl: './upgrade-kafka.component.html',
  styleUrls: ['./upgrade-kafka.component.css'],
})
export class UpgradeKafkaComponent implements OnInit {

  myform: FormGroup;

  chooseitem: OfferKafka;

  carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 4, lg: 4, all: 0 },
    load: 1,
    speed: 250,
    // interval: {timing: 4000, initialDelay: 4000},
    loop: true,
    touch: true,
    velocity: 0.2,
    point: {
      visible: true
    }
  }

  listOfServicePack: ServicePack[] = [];
  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;
  itemDetail: KafkaDetail;
  serviceOrderCode: string;
  kafkaUpgradeDto: KafkaUpgradeReq;
  ram: number;
  cpu: number;
  storage: number;
  initRam: number;
  initCpu: number;
  initStorage: number;

  listOfferKafka: OfferKafka[] = [];
  unitPrice = {
    ram: 240000,
    cpu: 105000,
    storage: 8500
  }
  regionId: number;
  projectId: number;

  remainAmount: number;
  upgradeAmount = 0;
  remainMonth: number;
  currentDate: Date;
  createDate: Date;
  expiryDate: Date;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingSrv: LoadingService,
    private kafkaService: KafkaService,
    private notification: NzNotificationService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private _activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    const regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.getListOffers();
    this.getUnitPrice();

    this._activatedRoute.params.subscribe((params) => {
      this.serviceOrderCode = params.id;
      if (this.serviceOrderCode) {
        this.getDetail();
      }
    });

    this.initForm();
  }

  getDetail() {
    this.kafkaService.getDetail(this.serviceOrderCode)
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.itemDetail = camelizeKeys(res.data) as KafkaDetail;
            this.currentDate = new Date();
            this.createDate = new Date(this.itemDetail.createdDate);
            this.expiryDate = new Date(this.itemDetail.expiryDate);
            const dateCount = Math.floor((Date.UTC(this.expiryDate.getFullYear(), this.expiryDate.getMonth(), this.expiryDate.getDate()) - Date.UTC(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate()) ) /(1000 * 60 * 60 * 24));
            this.remainMonth = Math.round((dateCount / 30 + Number.EPSILON) * 100) / 100;
            this.updateDataForm();
            this.ram = this.initRam = this.itemDetail.ram;
            this.cpu = this.initCpu = this.itemDetail.cpu;
            this.storage = this.initStorage = this.itemDetail.storage;
            if (this.remainMonth != 0 && this.initRam && this.initCpu && this.initStorage) {
              this.setRemainAmount();
            }
            // phát sự kiện để render lại 
            this.cdr.markForCheck();
          } else {
            this.notification.error('Thất bại', res.msg);
          }
        }
      )
  }

  initForm() {
    this.myform = this.fb.group({
      vCpu: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      ram: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      storage: [null, [Validators.required, Validators.min(1), Validators.max(1024), Validators.pattern("^[0-9]*$")]],
      broker: [3, [Validators.required]]
    });
  }

  updateDataForm() {
    this.myform.controls.vCpu.setValue(this.itemDetail.cpu);
    this.myform.controls.ram.setValue(this.itemDetail.ram);
    this.myform.controls.storage.setValue(this.itemDetail.storage);
    this.myform.controls.broker.disable();
    // this.myform.controls.storage.setValidators([Validators.minLength(this.itemDetail.storage)]);

  }

  getListPackage() {
    this.kafkaService.getListPackageAvailable()
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.listOfServicePack = camelizeKeys(res.data) as ServicePack[];
          }
        }
      )
  }

  getUnitPrice() {
    const unitMap = {
      'cpu': 'cpu',
      'ram': 'ram',
      'storage': 'storage_ssd'
    };
    this.kafkaService.getUnitPrice()
    .subscribe(
      res => {
        if (res && res.code == 200) {
          res.data.forEach(e => {
            const map = unitMap[e.item];
            if (map) {
              this.unitPrice[map] = e.price;
            }
          })
        }
      }
    )
  }

  getListOffers() {
    this.listOfferKafka = [];
    const characteristicMap = {
      'cpu': 'cpu',
      'ram': 'ram',
      'storage': 'storage'
    };
    this.kafkaService.getListOffers(this.regionId, 'kafka')
    .subscribe(
      (data) => {
        data.forEach(offer => {
          const offerKafka = new OfferKafka();
          offerKafka.id = offer.id;
          offerKafka.offerName = offer.offerName;
          offerKafka.price = offer.price;
          offerKafka.broker = 3;
          offer.characteristicValues.forEach(item => {
            const characteristic = characteristicMap[item.charName];
            if (characteristic) {
              offerKafka[characteristic] = Number.parseInt(item.charOptionValues[0]);
            }
          });
          this.listOfferKafka.push(offerKafka);
        });
        this.listOfferKafka = this.listOfferKafka.sort(
          (a, b) => a.price.fixedPrice.amount - b.price.fixedPrice.amount
        );
      }
    )
  }

  onChangeCpu(event: number) {
    this.cpu = event;
    if (event != null) {
      if (event <= this.initCpu) {
        this.myform.controls['vCpu'].setErrors({'invalid': true});
      } else {
        this.setUpgradeAmount();
      }
    }
  }

  onChangeRam(event: number) {
    this.ram = event;
    if (event != null) {
      if (event <= this.initRam) {
        this.myform.get('ram').setErrors({'invalid': true});
      } else {
        this.setUpgradeAmount();
      }
    }
  }

  onChangeStorage(event: number) {
    this.storage = event;
    if (event != null) {
      if (event <= this.initStorage) {
        this.myform.get('storage').setErrors({'invalid': true});
      } else {
        this.setUpgradeAmount();
      }
    }
  }

  setRemainAmount() {
    this.remainAmount = (this.initRam * this.unitPrice.ram + this.initCpu * this.unitPrice.cpu + this.initStorage * this.unitPrice.storage) * this.remainMonth;
  }

  setUpgradeAmount() {
    this.upgradeAmount = (this.ram * this.unitPrice.ram + this.cpu * this.unitPrice.cpu + this.storage * this.unitPrice.storage) * this.remainMonth;
  }

  backToList() {
    this.router.navigate(['/app-kafka']);
  }

  handleChoosePack(item: OfferKafka) {
    this.chooseitem = item;
    this.myform.get('vCpu').setValue(item.cpu);
    this.myform.get('ram').setValue(item.ram);
    this.myform.get('storage').setValue(item.storage);
    this.myform.get('broker').setValue(item.broker);
  }

  clicktab() {
    this.chooseitem = null;
    this.cpu = this.initCpu;
    this.ram = this.initRam;
    this.storage = this.initStorage;
    this.upgradeAmount = 0;

    this.myform.get('vCpu').setValue(this.initCpu);
    this.myform.get('ram').setValue(this.initRam);
    this.myform.get('storage').setValue(this.initStorage);
  }

  onSubmitPayment() {
    // handle payment
    const kafka = this.myform.getRawValue();
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];
    kafka.currentOfferId = this.itemDetail.offerId != null ? this.itemDetail.offerId : 0;
    kafka.newOfferId = this.chooseitem != null ? this.chooseitem.id : 0;
    kafka.newOfferName = this.chooseitem != null ? this.chooseitem.offerName : '';
    kafka.currentVcpu = this.initCpu;
    kafka.currentRam = this.initRam;
    kafka.currentStorage = this.initStorage;
    kafka.serviceName = this.itemDetail.serviceName;
    kafka.serviceOrderCode = this.itemDetail.serviceOrderCode;
    kafka.regionId = this.regionId;

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = this.upgradeAmount == 0 ? 0 : this.upgradeAmount - this.remainAmount;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = AppConstants.KAFKA_UPGRADE_TYPE;
    orderItem.specification = JSON.stringify(kafka);
    orderItem.serviceDuration = 1;

    data.orderItems = [...data.orderItems, orderItem];

    const returnPath = window.location.pathname;

    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
    // this.upgrade();
  }

  upgrade() {
    const dto = this.myform;
    this.kafkaUpgradeDto.serviceName = this.itemDetail.serviceName;
    this.kafkaUpgradeDto.serviceOrderCode = this.itemDetail.serviceOrderCode;
    this.kafkaUpgradeDto.version = this.itemDetail.version;
    this.kafkaUpgradeDto.description = this.itemDetail.description;
    this.kafkaUpgradeDto.cpu = dto.get('vCpu').value;
    this.kafkaUpgradeDto.ram = dto.get('ram').value;
    this.kafkaUpgradeDto.storage = dto.get('storage').value;

    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.kafkaService.upgrade(this.kafkaUpgradeDto)
      .pipe(
        finalize(() => this.loadingSrv.close())
      )
      .subscribe(
        (data) => {
          if (data && data.code == 200) {
            this.notification.success('Thành công', data.msg);
            // navigate
            this.backToList();
          } else {
            this.notification.error('Thất bại', data.msg);
          }
        }
      );
  }


}
