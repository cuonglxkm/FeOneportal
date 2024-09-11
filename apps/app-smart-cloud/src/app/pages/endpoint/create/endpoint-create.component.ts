import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NguCarouselConfig } from '@ngu/carousel';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject } from 'rxjs';
import { NAME_REGEX, USERNAME_REGEX } from 'src/app/shared/constants/constants';
import { OrderItemObject } from 'src/app/shared/models/price';
import { ObjectStorageService } from 'src/app/shared/services/object-storage.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { DataPayment, ItemPayment, OfferItem, Order, OrderItem } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { EndpointService } from 'src/app/shared/services/endpoint.service';
import { EndpointCreate } from 'src/app/shared/models/endpoint-init';
import { slider } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-endpoint-create',
  templateUrl: './endpoint-create.component.html',
  styleUrls: ['./endpoint-create.component.less'],
  animations: [slider]
})
export class EndpointCreateComponent implements OnInit {
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

  listOffers: OfferItem[] = [];
  offerFlavor: OfferItem;
  selectedElementFlavor: any;
  today = new Date();
  expiredDate = new Date();

  numOfMonth: number;
  total: any;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT = 0;

  selectedOfferId: number = 0;
  listOfDomain: any = [];

  EndpointCreate: EndpointCreate = new EndpointCreate();
  totalincludesVAT: number = 0;
 
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  timeSelected: any
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_REGEX)]],
    username: ['', [Validators.required, Validators.pattern(USERNAME_REGEX)]],
    email: ['', [Validators.required, Validators.email]],
    number: [1, Validators.required],
    time: [1]
  });
  private inputChangeSubject = new Subject<{ value: number, name: string }>();

  orderObject: OrderItemObject = new OrderItemObject();
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private service: ObjectStorageService,
    private endpointService: EndpointService,

  ) {
  
  }
  ngOnInit() {
    this.getOffers();
    this.checkExistName();
    this.checkExistUsername();
  }

  dataSubjectName: Subject<string> = new Subject<string>();
  dataSubjectUserame: Subject<string> = new Subject<string>();
  changeName(value: string) {
    this.dataSubjectName.next(value);
  }
  changeUsername(value: string) {
    this.dataSubjectUserame.next(value);
  }

  isExistName: boolean = false;
  isExistUsername: boolean = false;
  checkExistName() {
    this.dataSubjectName
      .pipe(
        debounceTime(300)
      )
      .subscribe((res) => {
        this.endpointService
          .checkExitName(res)
          .subscribe((data) => {
            this.isExistName = data;
          });
      });
  }
  checkExistUsername() {
    this.dataSubjectUserame
      .pipe(
        debounceTime(300)
      )
      .subscribe((res) => {
        this.endpointService
          .checkExitUsername(res)
          .subscribe((data) => {
            this.isExistUsername = data;
          });
      });
  }

  initEndpoint() {
    this.EndpointCreate.customerId = this.tokenService.get()?.userId;
    this.EndpointCreate.userEmail = this.tokenService.get()?.email;
    this.EndpointCreate.actorEmail = this.tokenService.get()?.email;
    this.EndpointCreate.projectId = null;
    this.EndpointCreate.regionId = 0;
    this.EndpointCreate.serviceType = 0;
    this.EndpointCreate.actionType = 0;
    this.EndpointCreate.serviceInstanceId = 0;
    this.EndpointCreate.createDate = this.today
    this.EndpointCreate.expireDate = this.expiredDate
    this.EndpointCreate.offerId = this.selectedOfferId;
    this.EndpointCreate.isSendMail = true
    this.EndpointCreate.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.Waf.WafCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"
  }
  isInvalid: boolean = false
  onChangeTime(numberMonth: number) {
    if(numberMonth === undefined){
      this.isInvalid = true
    }else{
      this.isInvalid = false
      this.timeSelected = numberMonth;
      this.form.controls.time.setValue(this.timeSelected);
      this.getTotalAmount();
    }
  }

  getTotalAmount() {
    this.initEndpoint();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = this.form.controls.number.value;
    itemPayment.specificationString = JSON.stringify(this.EndpointCreate);
    itemPayment.specificationType = 'endpoint_create';
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

  getOffers(): void {
    this.instancesService.getDetailProductByUniqueName('endpoint')
      .subscribe(
        data => {
          this.instancesService
            .getListOffersByProductIdNoRegion(data[0].id)
            .subscribe((data: any) => {
              this.listOffers = data.filter(
                (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
              );
              this.selectedOfferId = this.listOffers[0].id;
            });
        }
      );
  }

  orderItem: OrderItem[] = [];
  order: Order = new Order();
  handleSubmit() {
    this.orderItem = [];
    this.initEndpoint();
    let specification = JSON.stringify(this.EndpointCreate);
    let orderItemOS = new OrderItem();
    orderItemOS.orderItemQuantity = 1;
    orderItemOS.specification = specification;
    orderItemOS.specificationType = 'endpoint_create';
    orderItemOS.price = this.totalAmount;
    orderItemOS.serviceDuration = this.form.controls.time.value;
    this.orderItem.push(orderItemOS);

    this.order.customerId = this.tokenService.get()?.userId;
    this.order.createdByUserId = this.tokenService.get()?.userId;
    this.order.note = 'tạo endpoint';
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

}
