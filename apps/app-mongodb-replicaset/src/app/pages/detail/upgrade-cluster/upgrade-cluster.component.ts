import { MongodbDetail } from './../../../model/mongodb-detail.model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { ServiceAvailablePackage } from '../../../model/servicePackage';
import { MongoService } from '../../../service/mongo.service';
import { MongoPackDto } from '../../../model/offer.model';
import { Order, OrderItem } from '../../../model/order.model';
import { AppConstants } from '../../../constant/app-constant';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { UtilService } from '../../../service/utils.service';
import { NotiStatusEnum } from '../../../enum/noti-status.enum';
import { LoadingService } from '@delon/abc/loading';


interface MongodbUpgrade {
  serviceCode: string, 
  customerId: number, 
  userEmail : string,
  offerId: number,
  actionType: number,
  newOfferId : number,
  newRam: number,
  newCpu : number,
  newStorage : number,
  newVersion : string,
  regionId: number,
}


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'one-portal-upgrade-cluster',
  templateUrl: './upgrade-cluster.component.html',
  styleUrls: ['./upgrade-cluster.component.css'],
})
export class UpgradeClusterComponent implements OnInit{

  serviceCode: string;
  mongodb : MongodbDetail;
  regionId: number;
  projectId: number;
  chooseitem: MongoPackDto;
  listOfServiceAvailablePackage : MongoPackDto[] = []

  myform: FormGroup;

  remainAmount: number;
  upgradeAmount = 0;
  initRam: number;
  initCpu: number;
  initStorage: number;

  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;
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

  constructor(
    private fb : FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private cluster : MongoService,
    private utilService : UtilService,
    private loading : LoadingService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    this.getServiceCode()
    // this.mongodb = new MongodbDetail()
  }

  ngOnInit(): void {
    console.log('oninit')
    this.getDetail()
    this.getCatalogOffer();
    this.initForm();
    this.myform.get('node').setValue(3)
    this.myform.get('node').disable()
    // this.getAllServicePack();
  }

  getDetail() {
    this.cluster.getDetail(this.serviceCode).subscribe(
      (result : any) => {
        if(result && result.code == 200) {
          this.mongodb = result.data
          this.updateDataForm()
          this.cdr.markForCheck();
        } else {
          console.log('error')
        }

      }
    )
  }

  updateDataForm() {
    this.myform.controls.node.setValue(3);
    this.myform.controls.cpu.setValue(2);
    this.myform.controls.ram.setValue(8);
    this.myform.controls.storage.setValue(40);
  }

  initForm() {
    this.myform = this.fb.group({
      serviceName : [null, [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      version: [null, [Validators.required]],
      description: [null, [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9@,-_\\s]*$')]],
      cpu: [null, [Validators.required]],
      ram: [null, [Validators.required]],
      storage: [null, [Validators.required]],
      node: [null, [Validators.required]],
      usageTime: [1, [Validators.required]]
    })
  }

  onBlurStorage() {
    const storage_value = this.myform.get("storage").value;
    if (storage_value < 10) {
      this.myform.get("storage").setValue(10);
    } else if (storage_value > 1000) {
      this.myform.get("storage").setValue(1000);
    }
  }

  getAllServicePack() {
    this.cluster.getAllServiePack().subscribe(
      (data: any) => {
        this.listOfServiceAvailablePackage = data.data
      }
    )
  }

  cpu : number;
  ram : number;
  storage : number;
  clicktab() {
    console.log('click tab')
    // this.chooseitem = null;
    // this.cpu = this.initCpu;
    // this.memory = this.initMemory;
    // this.storage = this.initStorage;
    // this.upgradeAmount = 0;

    // this.myform.get('cpu').setValue(this.initCpu);
    // this.myform.get('memory').setValue(this.initMemory);
    // this.myform.get('storage').setValue(this.initStorage);
  }

  getServiceCode() {
    this._activatedRoute.params.subscribe(p => {
      this.serviceCode = p["id"];
    })
  }

  onRegionChange(region: RegionModel) {
    console.log('onRegionChange', region);
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  onChangeStorage(event: any) {
    console.log('onChangeStorage', event);
  }

  onChangeRam(event: any) {
    console.log('onChangeRam', event);
  }

  onChangeCpu(event: any) {
    console.log('onChangeCpu', event);
  }

  backToList() {
    this.router.navigate(['/app-mongodb-replicaset']);
  }

  handleChoosePack(item: MongoPackDto) {
    this.chooseitem = item;
    this.myform.get('cpu').setValue(item.cpu);
    this.myform.get('ram').setValue(item.ram);
    this.myform.get('node').setValue(item.node);
    this.myform.get('storage').setValue(item.storage);

  }

  onUpgradeSubmitPayment() {
    this.loading.open({type : 'spin',text : 'Loading...'})
    const mongodb = this.myform.value;
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];
    data.note = "";
    const mongodbChoosen : MongodbUpgrade = {

      serviceCode: this.serviceCode,
      customerId: userId, 
      userEmail : this.tokenService.get()?.email,
      offerId: this.chooseitem.id,
      actionType: 1,
      newOfferId : this.chooseitem.id,
      newRam: mongodb.ram,
      newCpu : mongodb.cpu,
      newStorage : mongodb.storage,
      newVersion : this.mongodb.version,
      regionId: this.regionId,
    }
    // mongodb.offerId = this.chooseitem != null ? this.chooseitem.id : 0;
    // mongodb.regionId = this.regionId;
    // mongodb.projectId = this.projectId;
    // mongodb.vpcId = this.projectId;
    // mongodb.offerName = this.chooseitem != null ? this.chooseitem.offerName : '';


    // const orderItem: OrderItem = new OrderItem();
    // orderItem.price = 100000;
    // orderItem.orderItemQuantity = 1;
    // orderItem.specificationType = AppConstants.MONGODB_UPGRADE_TYPE;
    // orderItem.specification = JSON.stringify(mongodbChoosen);
    // orderItem.serviceDuration = mongodb.usageTime;
    // orderItem.sortItem = 0;
    this.cluster.upgrade(mongodbChoosen).subscribe(
      (r : any) => {
        if(r.code == 200) {
          this.utilService.showNotification(NotiStatusEnum.SUCCESS, r.message, "Thông báo")
          this.router.navigate(['/app-mongodb-replicaset']);
        } else {
          this.utilService.showNotification(NotiStatusEnum.ERROR, r.message, "Thông báo")
        }
        this.loading.close()
      }
    )

    

    // redirect to page after payment successfully
    // this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
  }

  getCatalogOffer() {
    // this.listOfferKafka = [];
    const characteristicMap = {
      cpu: 'cpu',
      ram: 'ram',
      storage: 'storage',
    };
    this.cluster.getCatalogsOffer().subscribe((data: any) => {
      data.forEach((offer) => {
        const offerMongodb = new MongoPackDto();
        offerMongodb.id = offer.id;
        offerMongodb.offerName = offer.offerName;
        offerMongodb.price = offer.price;
        offerMongodb.node = 3;
        offer.characteristicValues.forEach((item) => {
          const characteristic = characteristicMap[item.charName];
          if (characteristic) {
            offerMongodb[characteristic] = Number.parseInt(
              item.charOptionValues[0]
            );
          }
        });
        this.listOfServiceAvailablePackage.push(offerMongodb);
      });
      this.listOfServiceAvailablePackage =
        this.listOfServiceAvailablePackage.sort(
          (a, b) => a.price.fixedPrice.amount - b.price.fixedPrice.amount
        );
    });
  }


}
