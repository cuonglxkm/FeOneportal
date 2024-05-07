import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { KubernetesCluster, WorkerGroupModel } from '../../model/cluster.model';
import { ClusterService } from '../../services/cluster.service';
import { ActivatedRoute, Router } from '@angular/router';
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
import { forkJoin } from 'rxjs';

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
  choosePackDescription: string;
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

  upgradeForm: FormGroup;
  listFormWorker: FormArray;

  DEFAULT_VOLUME_TYPE = KubernetesConstant.DEFAULT_VOLUME_TYPE;

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
    private route: Router,
    private notificationService: NzNotificationService,
    private titleService: Title,
    private fb: FormBuilder,
    private vlanService: VlanService
  ) {
    this.listOfServicePack = [];
    this.currentDate = new Date();
    this.isSubmitting = false;
    this.isUsingPackConfig = true;
    this.isShowModalCancelUpgrade = false;
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
      workerGroupName: [null, [Validators.required, Validators.maxLength(16), this.validateUnique(index),
        Validators.pattern(KubernetesConstant.WORKERNAME_PATTERN)]],
      nodeNumber: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      volumeStorage: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      volumeType: [this.DEFAULT_VOLUME_TYPE, [Validators.required]],
      volumeTypeId: [null, [Validators.required]],
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

    });
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  getListK8sVersion(regionId: number, cloudProfileName: string) {
    this.listOfK8sVersion = [];
    this.clusterService.getListK8sVersion(regionId, cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfK8sVersion = r.data;
        } else {
          this.notificationService.error("Thất bại", r.message);
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
          this.notificationService.error("Thất bại", r.message);
        }
      })
  }

  getListVolumeType(regionId: number,cloudProfileName: string) {
    this.listOfVolumeType = [];
    this.clusterService.getListVolumeTypes(regionId, cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfVolumeType = r.data;
        } else {
          this.notificationService.error("Thất bại", r.message);
        }
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
    this.choosePackDescription = '';
    this.clearFormWorker();

    if (this.detailCluster && this.listOfServicePack) {
      this.currentPackItem = this.listOfServicePack.find(pack => pack.offerId == this.detailCluster.offerId);
    }

    let listOfDescriptionCustomPack = [];
    for (let i = 0; i < this.listFormWorker.length; i++) {
      let wg = this.listFormWorker.at(i).value;
      let str = '<div>' + wg.workerGroupName + ' / ' + wg.cpu + 'vCPU / ' + wg.ram + 'GB / '
      + wg.volumeSize + 'GB ' + wg.volumeTypeName + '</div>';
      listOfDescriptionCustomPack.push(str);
    }
    this.choosePackDescription = listOfDescriptionCustomPack.join(' ');
  }

  onSelectCustomPackTab() {
    this.chooseItem = null;
    this.isUsingPackConfig = false;
    this.choosePackDescription = null;
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

    this.choosePackDescription = item.packName + " / " + item.cpu + "vCPU / "
    + item.ram + "GB / " + item.rootStorage + "GB " + item.rootStorageName;
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

  onSelectWorkerType(machineName: string, index: number) {
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

  onCalculatePrice() {

  }

  clearFormWorker() {
    while (this.listFormWorker.length != 0) {
      this.listFormWorker.removeAt(0);
    }
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

  submitUpgrade() {
    this.validateForm();

  }

  handleShowModalCancelUpgrade() {
    this.isShowModalCancelUpgrade = true;
  }

  handleCancelModal() {
    this.isShowModalCancelUpgrade = false;
  }

  back2list() {
    this.route.navigate(['/app-kubernetes']);
  }

  onChangeTab(index: number) {
    this.selectedTabIndex = index;
  }

}
