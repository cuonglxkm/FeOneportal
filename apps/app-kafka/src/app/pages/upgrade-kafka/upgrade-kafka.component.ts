import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { camelizeKeys } from 'humps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';
import { ServicePack } from 'src/app/core/models/service-pack.model';
import { KafkaService } from 'src/app/services/kafka.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'one-portal-upgrade-kafka',
  templateUrl: './upgrade-kafka.component.html',
  styleUrls: ['./upgrade-kafka.component.css'],
})
export class UpgradeKafkaComponent implements OnInit {

  myform: FormGroup;

  chooseitem: ServicePack;

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
  servicePackCode: string;
  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;
  usageTime = 1;
  itemDetail: KafkaDetail;
  serviceOrderCode: string;
  createDate: Date;
  expiryDate: Date;

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
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
    this._activatedRoute.params.subscribe((params) => {
      this.serviceOrderCode = params.id;
      if (this.serviceOrderCode) {
        this.getDetail();
      }
    });

    this.getListPackage();
    this.initForm();
  }

  getDetail() {
    this.kafkaService.getDetail(this.serviceOrderCode)
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.itemDetail = camelizeKeys(res.data) as KafkaDetail;
            this.createDate = new Date(this.itemDetail.createdDate);
            this.expiryDate = new Date(this.itemDetail.createdDate);
            this.updateDataForm();
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
      vCpu: [null, [Validators.required]],
      ram: [null, [Validators.required]],
      storage: [null, [Validators.required, Validators.min(1), Validators.max(1024)]],
      broker: [3, [Validators.required]],
      usageTime: [1, [Validators.required]]
    });
  }

  updateDataForm() {    
    this.myform.controls.vCpu.setValue(this.itemDetail.cpu);
    this.myform.controls.ram.setValue(this.itemDetail.ram);
    this.myform.controls.storage.setValue(this.itemDetail.storage);
    this.myform.controls.storage.setValue(this.itemDetail.storage);
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

  backToList() {
    this.router.navigate(['/app-kafka']);
  }

  handleChoosePack(item: ServicePack) {
    this.chooseitem = item;
    this.servicePackCode = item.servicePackCode;
    this.myform.get('vCpu').setValue(item.cpu);
    this.myform.get('ram').setValue(item.ram);
    this.myform.get('storage').setValue(item.storage);
    this.myform.get('broker').setValue(item.broker);
  }

  clicktab() {
    this.chooseitem = null;
  }

  onChangeUsageTime() {
    this.usageTime = this.myform.controls.usageTime.value;
    this.expiryDate = new Date(this.createDate.getTime() + (this.usageTime * 30 * 24 * 60 * 60 * 1000));
  }

  onSubmitPayment() {
    // handle payment

    this.upgrade();
  }

  upgrade() {
    this.notification.success('Thành công', 'Yêu cầu nâng cấp dịch vụ thành công.');
    this.backToList();
  }


}
