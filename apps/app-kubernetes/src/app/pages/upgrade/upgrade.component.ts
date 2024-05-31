import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { KubernetesCluster, Order, OrderItem, OrderItemPayment, OrderPayment, UpgradeWorkerGroupDto, WorkerGroupModel, WorkerGroupReqDto } from '../../model/cluster.model';
import { ClusterService } from '../../services/cluster.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PackModel } from '../../model/pack.model';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkerTypeModel } from '../../model/worker-type.model';
import { VolumeTypeModel } from '../../model/volume-type.model';
import { PriceModel } from '../../model/price.model';
import { K8sVersionModel } from '../../model/k8s-version.model';
import { VlanService } from '../../services/vlan.service';
import { finalize, forkJoin, map } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { UserInfo } from '../../model/user.model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '../../core/i18n/i18n.service';
import { CostService } from '../../services/cost.service';

@Component({
  selector: 'one-portal-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.css'],
})
export class UpgradeComponent implements OnInit {

  detailCluster: KubernetesCluster;
  serviceOrderCode: string;
  cloudProfileId: string;

  chooseItem: PackModel;
  upgradePackDescription: string;
  currentPackItem: PackModel;
  currentPackDescription: string;
  currentDate: Date;
  offerId: number;
  selectedTabIndex: number;

  listOfServicePack: PackModel[];
  listOfWorkerType: WorkerTypeModel[];
  listOfVolumeType: VolumeTypeModel[];
  listOfPriceItem: PriceModel[];
  listOfK8sVersion: K8sVersionModel[];

  isSubmitting: boolean;
  isUsingPackConfig: boolean;
  isShowModalCancelUpgrade: boolean;
  isChangeInfo: boolean;
  isShowModalConfirmUpgrade: boolean;
  isAgreeArrangement: boolean;

  upgradeForm: FormGroup;
  listFormWorker: FormArray;

  DEFAULT_VOLUME_TYPE = KubernetesConstant.DEFAULT_VOLUME_TYPE;
  defaultVolumeTypeName: string;

  carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 4, lg: 4, all: 0 },
    load: 1,
    speed: 250,
    // interval: {timing: 4000, initialDelay: 4000},
    // loop: true,
    touch: true,
    velocity: 0.2,
    point: {
      visible: true
    }
  }
  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;

  constructor(
    private clusterService: ClusterService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notificationService: NzNotificationService,
    private titleService: Title,
    private fb: FormBuilder,
    private vlanService: VlanService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private costService: CostService,
    private cdr: ChangeDetectorRef
  ) {
    this.listOfServicePack = [];
    this.currentDate = new Date();
    this.isSubmitting = false;
    this.isUsingPackConfig = true;
    this.isShowModalCancelUpgrade = false;
    this.isChangeInfo = false;
    this.isShowModalConfirmUpgrade = false;
    this.isAgreeArrangement = false;
    this.selectedTabIndex = 0;
    this.listOfK8sVersion = [];
    this.listOfVolumeType = [];
    this.listOfWorkerType = [];
    this.listOfPriceItem = [];
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
    });

    this.initForm();

    this.getListPriceItem();

    this.getUserInfo(this.tokenService.get()?.userId);
  }

  initForm() {
    this.listFormWorker = this.fb.array([]);

    this.upgradeForm = this.fb.group({
      serviceOrderCode: [this.serviceOrderCode, [Validators.required]],
      workerGroup: this.listFormWorker
    });
  }

  addWorkerGroup(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }

    const index = this.listFormWorker ? this.listFormWorker.length : 0;
    const wg = this.fb.group({
      id: [null],
      workerGroupName: [null, [Validators.required, Validators.maxLength(16), this.validateUnique(index),
        Validators.pattern(KubernetesConstant.WORKERNAME_PATTERN)]],
      nodeNumber: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      volumeStorage: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      volumeType: [this.DEFAULT_VOLUME_TYPE, [Validators.required]],
      volumeTypeId: [null, [Validators.required]],
      volumeTypeName: [this.defaultVolumeTypeName, [Validators.required]],
      configType: [null, [Validators.required]],
      configTypeId: [null, [Validators.required]],
      autoScalingWorker: [false, Validators.required],
      autoHealing: [true, Validators.required],
      minimumNode: [null],
      maximumNode: [null],
      cpu: [null],
      ram: [null]
    });
    this.listFormWorker.push(wg);

    // fill volumeTypeId by default value when add new worker group
    const volumeType = this.listOfVolumeType?.find(item => item.volumeType === KubernetesConstant.DEFAULT_VOLUME_TYPE);
    if (volumeType) {
      this.listFormWorker.at(index).get('volumeTypeId').setValue(volumeType.id);
    }
  }

  regionId: number;
  projectId: number;

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.cloudProfileId = KubernetesConstant.OPENSTACK_LABEL;

    this.getListK8sVersion(this.regionId, this.cloudProfileId);
    this.getListWorkerType(this.regionId, this.cloudProfileId);
    this.getListVolumeType(this.regionId, this.cloudProfileId);

    let detailClusterObs = this.clusterService.getDetailCluster(this.serviceOrderCode);
    let listPackObs = this.clusterService.getListPack(this.cloudProfileId);

    forkJoin([detailClusterObs, listPackObs]).subscribe((response: any[]) => {
      // get list pack
      response[1].data?.forEach(item => {
        const p = new PackModel(item);
        this.listOfServicePack.push(p);
      });
      this.myCarousel.pointNumbers = Array.from({length: this.listOfServicePack.length}, (_, i) => i + 1);


      // get detail cluster
      this.detailCluster = new KubernetesCluster(response[0].data);
      this.offerId = this.detailCluster.offerId;

      this.getVlanbyId(this.detailCluster.vpcNetworkId);

      this.titleService.setTitle('Chi tiết cluster ' + this.detailCluster.clusterName);

      // init pack info
      if (this.offerId == 0) {
        // customize pack
        let listOfDescriptionWg = [];
        for (let wg of this.detailCluster.workerGroup) {
          let des = '<div>' + wg.workerGroupName + ' / ' + wg.cpu + 'vCPU / ' + wg.ram + 'GB / '
          + wg.volumeSize + 'GB ' + wg.volumeTypeName + '</div>';
          listOfDescriptionWg.push(des);
        }
        this.currentPackDescription = listOfDescriptionWg.join(' ');
        this.selectedTabIndex = 1;
        this.onSelectCustomPackTab();
      } else {
        const currentPack = this.listOfServicePack?.find(pack => pack.offerId = this.offerId);
        this.currentPackDescription = currentPack.packName + " / " + currentPack.cpu + "vCPU / "
            + currentPack.ram + "GB / " + currentPack.rootStorage + "GB " + currentPack.rootStorageName;
        this.selectedTabIndex = 0;
        this.onSelectPackTab();
      }

      // init calculate cost
      this.onCalculatePrice();
    });
  }

  projectName: string;
  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.projectName = project.projectName;
  }

  getListK8sVersion(regionId: number, cloudProfileName: string) {
    this.listOfK8sVersion = [];
    this.clusterService.getListK8sVersion(regionId, cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfK8sVersion = r.data;
        } else {
          this.notificationService.error(this.i18n.fanyi('app.status.fail'), r.message);
        }
      });
  }

  getListWorkerType(regionId: number,cloudProfileName: string) {
    this.listOfWorkerType = [];
    this.clusterService.getListWorkerTypes(regionId, cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfWorkerType = r.data;
        } else {
          this.notificationService.error(this.i18n.fanyi('app.status.fail'), r.message);
        }
      })
  }

  getListVolumeType(regionId: number,cloudProfileName: string) {
    this.listOfVolumeType = [];
    this.clusterService.getListVolumeTypes(regionId, cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfVolumeType = r.data;

          // get default volume type name
          const vlt = this.listOfVolumeType.find(vlt => vlt.volumeType == this.DEFAULT_VOLUME_TYPE);
          if (vlt) {
            this.defaultVolumeTypeName = vlt.volumeTypeName;
          }
        } else {
          this.notificationService.error(this.i18n.fanyi('app.status.fail'), r.message);
        }
      });
  }

  userInfo: UserInfo;
  getUserInfo(userId: number) {
    this.clusterService.getUserInfo(userId)
    .subscribe((r: any) => {
      this.userInfo = r;
    });
  }

  vpcNetwork: string;
  getVlanbyId(vlanId: number) {
    this.vlanService.getVlanById(vlanId)
      .subscribe((r: any) => {
        if (r) {
          this.vpcNetwork = r.name;
        }
      });
  }

  isAutoScale: boolean;
  onChangeAutoScale(event: any) {
    this.isAutoScale = event;
  }

  isAutoScaleAtIndex(index: number) {
    return this.listFormWorker.at(index).get('autoScalingWorker').value;
  }

  onChangeNodeValue(index: number) {
    const minNode = this.listFormWorker.at(index).get('minimumNode').value;
    const maxNode = this.listFormWorker.at(index).get('maximumNode').value;
    if (minNode && maxNode) {
      if (+minNode > +maxNode) {
        this.listFormWorker.at(index).get('minimumNode').setErrors({invalid: true});
      } else {
        delete this.listFormWorker.at(index).get('minimumNode').errors?.invalid;
        this.listFormWorker.at(index).get('minimumNode').updateValueAndValidity();
      }
    }
  }

  removeWorkerGroup(index: number, e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    this.listFormWorker.removeAt(index);
  }

  onSelectVolumeType(volumeType: string, index: number) {
    const selectedVolumeType = this.listOfVolumeType.find(item => item.volumeType === volumeType);
    this.listFormWorker.at(index).get('volumeTypeId').setValue(selectedVolumeType.id);
  }

  onSelectPackTab() {
    this.chooseItem = null;
    this.isUsingPackConfig = true;
    this.upgradePackDescription = '';
    this.clearFormWorker();

    if (this.detailCluster && this.listOfServicePack) {
      this.currentPackItem = this.listOfServicePack.find(pack => pack.offerId == this.detailCluster.offerId);
    }

    let listOfDescriptionPack = [];
    for (let i = 0; i < this.listFormWorker.length; i++) {
      let wg = this.listFormWorker.at(i).value;
      let str = '<div>' + wg.workerGroupName + ' / ' + wg.cpu + 'vCPU / ' + wg.ram + 'GB / '
          + wg.volumeSize + 'GB ' + wg.volumeTypeName + '</div>';
      listOfDescriptionPack.push(str);
    }
    this.upgradePackDescription = listOfDescriptionPack.join(' ');
  }

  onSelectCustomPackTab() {
    this.chooseItem = null;
    this.isUsingPackConfig = false;
    this.isChangeInfo = true;
    this.upgradePackDescription = null;
    this.clearFormWorker();

    const wgs: WorkerGroupModel[] = this.detailCluster.workerGroup;

    for (let i = 0; i < wgs.length; i++) {
      const isAutoScale = wgs[i].autoScaling;
      let nodeNumber: number;
      if (isAutoScale) {
        nodeNumber = wgs[i].nodeNumber;
      } else {
        nodeNumber = wgs[i].minimumNode;
      }

      const wg = this.fb.group({
        id: [wgs[i].id],
        workerGroupName: [wgs[i].workerGroupName,
          [Validators.required, Validators.maxLength(16), this.validateUnique(i), Validators.pattern(KubernetesConstant.WORKERNAME_PATTERN)]],
        nodeNumber: [nodeNumber, [Validators.required, Validators.min(1), Validators.max(10)]],
        volumeStorage: [wgs[i].volumeSize, [Validators.required, Validators.min(20), Validators.max(1000)]],
        volumeType: [wgs[i].volumeType],
        volumeTypeName: [wgs[i].volumeTypeName],
        volumeTypeId: [wgs[i].volumeTypeId, [Validators.required]],
        configType: [wgs[i].machineTypeName, [Validators.required]],
        configTypeId: [wgs[i].machineTypeId, [Validators.required]],
        autoScalingWorker: [wgs[i].autoScaling, Validators.required],
        autoHealing: [wgs[i].autoHealing, Validators.required],
        minimumNode: [null],
        maximumNode: [null],
        ram: [wgs[i].ram],
        cpu: [wgs[i].cpu]
      });

      this.listFormWorker.push(wg);
    }
  }

  onChoosePack(item: PackModel) {
    this.chooseItem = item;
    this.isChangeInfo = true;

    if (this.chooseItem) {
      // this.myform.get('volumeCloudSize').setValue(this.chooseItem.volumeStorage);
      // this.myform.get('volumeCloudType').setValue(this.volumeCloudType);

      this.clearFormWorker();
      let wgs = this.detailCluster.workerGroup; // using pack => only 1 worker group

      // add worker group
      let wgf = this.fb.group({
        id: [wgs[0].id],
        workerGroupName: [KubernetesConstant.DEFAULT_WORKER_NAME],
        nodeNumber: [this.chooseItem.workerNode],
        volumeStorage: [this.chooseItem.rootStorage],
        volumeType: [this.chooseItem.rootStorageType],
        volumeTypeId: [this.chooseItem.volumeTypeId],
        volumeTypeName: [this.chooseItem.rootStorageName],
        configType: [this.chooseItem.machineType],
        configTypeId: [this.chooseItem.machineTypeId],
        autoScalingWorker: [false],
        autoHealing: [true],
        minimumNode: [null],
        maximumNode: [null],
        cpu: [this.chooseItem.cpu],
        ram: [this.chooseItem.ram]
      });

      this.listFormWorker.push(wgf);
    }

    this.upgradePackDescription = item.packName + " / " + item.cpu + "vCPU / "
    + item.ram + "GB / " + item.rootStorage + "GB " + item.rootStorageName;

    this.onCalculatePrice();
  }

  onChangeNodeNumber(event: number, index: number) {
    const idWorker = this.listFormWorker.at(index).get('id').value;
    if (idWorker) {
      const oldWorkerInfo = this.detailCluster.workerGroup.find(item => item.id == idWorker);
      const oldNodeNumber = oldWorkerInfo.minimumNode;
      if (event && Number(event) < oldNodeNumber) {
        this.listFormWorker.at(index).get('nodeNumber').setErrors({invalid: true});
      } else {
        delete this.listFormWorker.at(index).get('nodeNumber').errors?.invalid;
      }
    }
  }

  onSelectConfigType(machineName: string, index: number) {
    const selectedWorkerType = this.listOfWorkerType.find(item => item.machineName === machineName);
    this.listFormWorker.at(index).get('configTypeId').setValue(selectedWorkerType.id);
  }

  onChangeConfigType(machineName: string, index: number) {
    // check resource is not downgrade compare to old config
    const idWorker = this.listFormWorker.at(index).get('id').value;
    const selectedConfig = this.listOfWorkerType.find(item => machineName == item.machineName);
    if (idWorker) {
      const oldWorkerInfo = this.detailCluster.workerGroup.find(item => item.id == idWorker);
      if (selectedConfig.cpu < oldWorkerInfo.cpu || selectedConfig.ram < oldWorkerInfo.ram) {
        this.listFormWorker.at(index).get('configType').setErrors({invalid: true});
      } else {
        delete this.listFormWorker.at(index).get('configType').errors?.invalid;
      }
    }

    this.listFormWorker.at(index).get('configTypeId').setValue(selectedConfig.id);
    this.listFormWorker.at(index).get('ram').setValue(selectedConfig.ram);
    this.listFormWorker.at(index).get('cpu').setValue(selectedConfig.cpu);

    this.onCalculatePrice();
  }

  onChangeVolumeWorker(event: number, index: number) {
    const idWorker = this.listFormWorker.at(index).get('id').value;
    // worker is existed and all parameters must be equal or greater than current
    if (idWorker) {
      const oldWorkerInfo = this.detailCluster.workerGroup.find(item => item.id == idWorker);
      if (event && Number(event) < oldWorkerInfo.volumeSize) {
        this.listFormWorker.at(index).get('volumeStorage').setErrors({invalid: true});
      } else {
        delete this.listFormWorker.at(index).get('volumeStorage').errors?.invalid;
      }
    }
  }

  getListPriceItem() {
    this.clusterService.getListPriceItem()
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfPriceItem = r.data;
        // this.initPrice();
      } else {
        this.notificationService.error(this.i18n.fanyi('app.status.fail'), r.message);
      }
    });
  }

  newConfigCost: number;
  upgradeCost: number;
  currentRegisteredCost: number;
  totalCost: number;
  vatCost: number;
  vatPercent: number;
  costPerDay: number;
  onCalculatePrice() {
    this.calculateNewConfig();
    this.calculateCurrentConfig();
    this.onHanldeGetTotalAmount();
  }

  newTotalCpu: number;
  newTotalRam: number;
  newTotalStorage: number;
  calculateNewConfig() {
    this.newTotalCpu = 0;
    this.newTotalRam = 0;
    this.newTotalStorage = 0;
    this.newConfigCost = 0;

    if (this.chooseItem) {
      // using pack
      return this.chooseItem.price;

    } else {

      for (let i = 0; i < this.listFormWorker.length; i++) {
        let wg = this.listFormWorker.at(i).value;
        const cpu = wg.cpu ? wg.cpu : 0;
        const ram = wg.ram ? wg.ram : 0;
        const storage = +wg.volumeStorage ? +wg.volumeStorage : 0;
        const autoScale = wg.autoScalingWorker;
        let nodeNumber: number;
        if (autoScale) {
          // TODO: ...
        } else {
          nodeNumber = wg.nodeNumber ? wg.nodeNumber : 0;
        }

        this.newTotalCpu += nodeNumber * cpu;
        this.newTotalRam += nodeNumber * ram;
        this.newTotalStorage += nodeNumber * storage;
      }
    }
  }

  currentTotalCpu: number;
  currentTotalRam: number;
  currentTotalStorage: number;
  calculateCurrentConfig() {
    this.currentTotalCpu = 0;
    this.currentTotalRam = 0;
    this.currentTotalStorage = 0;
    this.currentRegisteredCost = 0;

    const offerId = this.detailCluster.offerId;
    if (offerId != 0) {
      // using pack
      const pack = this.listOfServicePack.find(pack => pack.offerId = offerId);
      const nodeNumber = pack.workerNode;
      this.currentTotalCpu = nodeNumber * pack.cpu;
      this.currentTotalRam = nodeNumber * pack.ram;
      this.currentTotalStorage = nodeNumber * pack.rootStorage + pack.volumeStorage;

    } else {

      let wgs = this.detailCluster.workerGroup;
      for (let i = 0; i < wgs.length; i++) {
        // console.log(wgs[i]);
        const cpu = wgs[i].cpu ? wgs[i].cpu : 0;
        const ram = wgs[i].ram ? wgs[i].ram : 0;
        const storage = +wgs[i].volumeSize ? +wgs[i].volumeSize : 0;
        const autoScale = wgs[i].autoScaling;
        let nodeNumber: number;
        if (autoScale) {
          // TODO: ...
        } else {
          nodeNumber = wgs[i].minimumNode ? wgs[i].minimumNode : 0;
        }

        this.currentTotalCpu += nodeNumber * cpu;
        this.currentTotalRam += nodeNumber * ram;
        this.currentTotalStorage += nodeNumber * storage;
      }
    }
  }

  onHanldeGetTotalAmount() {
    let orderPayment: OrderPayment = new OrderPayment();
    orderPayment.projectId = this.projectId;
    orderPayment.orderItems = [];

    let orderItemPayment: OrderItemPayment = new OrderItemPayment();
    orderItemPayment.sortItem = 0;
    orderItemPayment.orderItemQuantity = 1;
    orderItemPayment.specificationType = KubernetesConstant.CLUSTER_UPGRADE_TYPE;
    orderItemPayment.specificationString = JSON.stringify({
      serviceInstanceId: this.detailCluster.id,
      regionId: this.regionId,
      currentOfferId: this.detailCluster.offerId ? this.detailCluster.offerId : 0,
      newOfferId: this.chooseItem ? this.chooseItem.offerId : 0,
      currentTotalCpu: this.currentTotalCpu ? this.currentTotalCpu : 0,
      currentTotalRam: this.currentTotalRam ? this.currentTotalRam : 0,
      currentTotalStorage: this.currentTotalStorage ? this.currentTotalStorage : 0,
      newTotalCpu: this.newTotalCpu ? this.newTotalCpu : 0,
      newTotalRam: this.newTotalRam ? this.newTotalRam : 0,
      newTotalStorage: this.newTotalStorage ? this.newTotalStorage : 0,
    });

    orderPayment.orderItems = [...orderPayment.orderItems, orderItemPayment];
    this.getTotalAmount(orderPayment);
  }

  isCalculating: boolean = false;
  getTotalAmount(data: OrderPayment) {
    this.isCalculating = true;
    this.costService.getTotalAmount(data)
    .pipe(finalize(() => {
      this.isCalculating = false;
      this.cdr.detectChanges();
    }), map((r: any) => r.data))
    .subscribe((r: any) => {
      this.vatCost = r.totalVAT.amount;
      this.vatPercent = r.currentVAT;
      this.newConfigCost = r.orderItemPrices[0].unitPrice.amount;
      this.upgradeCost = r.totalAmount.amount;
      this.totalCost = r.totalPayment.amount;
    });
  }

  clearFormWorker() {
    while (this.listFormWorker.length != 0) {
      this.listFormWorker.removeAt(0);
    }

    this.totalCost = 0;
    this.vatCost = 0;
    this.newConfigCost = 0;
  }

  // validate duplicate worker group name
  validateUnique(index: number) {
    return (control: AbstractControl) => {
      if (control.value) {
        const formArray = control.parent
          ? (control.parent.parent as FormArray)
          : null;
        if (formArray) {
          const attributes = formArray.value.map((x) => x.workerGroupName);
          return attributes.indexOf(control.value) >= 0 && attributes.indexOf(control.value) < index
            ? { duplicateName: true }
            : null;
        }
      }
    };
  }

  checkDuplicate(index: number) {
    this.listFormWorker.controls.forEach((x, i) => {
      if (index != i)
        (x as FormGroup).get('workerGroupName').updateValueAndValidity();
    })
  }

  isNumber(event) {
    const reg = new RegExp('^[0-9]+$');
    const input = event.key;
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  validateForm() {
    for (const i in this.upgradeForm.controls) {
      this.upgradeForm.controls[i].markAsDirty();
      this.upgradeForm.controls[i].updateValueAndValidity();
    }
  }

  onValidateInfo = () => {
    this.validateForm();

    this.isSubmitting = true;
    let cluster = this.setClusterData();
    // this.submitUpgrade(cluster);

    let reqDto = new UpgradeWorkerGroupDto(cluster);
    this.clusterService.validateUpgradeCluster(reqDto)
    .pipe(finalize(() => this.isSubmitting = false))
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        let status = r.data;
        if (status == 'upgraded') {
          // only change name, redirect list service
          this.notificationService.success(this.i18n.fanyi('app.status.success'), r.message);
          this.router.navigate(['/app-kubernetes']);

        } else {
          // call payment
          this.submitUpgrade(cluster);
        }
      }
    });

  }

  submitUpgrade(cluster: any) {
    // console.log({cluster: cluster});
    // console.log({form: this.upgradeForm});

    // build order request
    let order = new Order();
    const userId = this.tokenService.get()?.userId;
    order.customerId = userId;
    order.createdByUserId = userId;
    order.orderItems = [];

    let orderItem = new OrderItem();
    orderItem.price = this.upgradeCost;
    orderItem.serviceDuration = this.detailCluster.usageTime;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = KubernetesConstant.CLUSTER_UPGRADE_TYPE;
    orderItem.specification = JSON.stringify(cluster);

    order.orderItems = [...order.orderItems, orderItem];

    // console.log({order: order});
    let returnPath = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: order, path: returnPath}});
  }

  setClusterData() {
    let cluster = this.upgradeForm.value;
    cluster.currentOfferId = this.detailCluster.offerId ? this.detailCluster.offerId : 0;
    cluster.newOfferId = this.chooseItem ? this.chooseItem.offerId : 0;

    cluster.currentTotalCpu = this.currentTotalCpu ? this.currentTotalCpu : 0;
    cluster.currentTotalRam = this.currentTotalRam ? this.currentTotalRam : 0;
    cluster.currentTotalStorage = this.currentTotalStorage ? this.currentTotalStorage : 0;

    cluster.newTotalCpu = this.newTotalCpu ? this.newTotalCpu : 0;
    cluster.newTotalRam = this.newTotalRam ? this.newTotalRam : 0;
    cluster.newTotalStorage = this.newTotalStorage ? this.newTotalStorage : 0;

    cluster.regionId = this.regionId;
    cluster.serviceName = this.detailCluster.clusterName;
    cluster.serviceType = KubernetesConstant.K8S_TYPE_ID;
    cluster.sortItem = 0;
    cluster.tenant = this.projectName;

    const wgs: [] = cluster.workerGroup;
    const tmp: WorkerGroupReqDto[] = [];
    for (let i = 0; i < wgs.length; i++) {
      const wg = new WorkerGroupReqDto(wgs[i]);
      tmp.push(wg);
    }
    cluster.jsonData = JSON.stringify({
      ServiceOrderCode: this.serviceOrderCode,
      WorkerGroup: tmp,
      Id: this.userInfo.id,
      UserName: this.userInfo.name,
      PhoneNumber: this.userInfo.phoneNumber,
      UserEmail: this.userInfo.email,
    });

    return cluster;
  }

  callme() {
    console.log({form: this.upgradeForm});
  }

  handleShowModalCancelUpgrade() {
    this.isShowModalCancelUpgrade = true;
  }

  handleShowModalConfirmUpgrade() {
    this.isShowModalConfirmUpgrade = true;
  }

  handleCancelModal() {
    this.isShowModalCancelUpgrade = false;
    this.isShowModalConfirmUpgrade = false;
    this.isAgreeArrangement = false;
  }

  back2list() {
    this.router.navigate(['/app-kubernetes']);
  }

  onChangeTab(index: number) {
    this.selectedTabIndex = index;
  }

}
