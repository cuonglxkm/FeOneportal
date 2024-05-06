import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { KubernetesCluster, WorkerGroupModel } from '../../model/cluster.model';
import { ClusterService } from '../../services/cluster.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PackModel } from '../../model/pack.model';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkerTypeModel } from '../../model/worker-type.model';
import { VolumeTypeModel } from '../../model/volume-type.model';
import { PriceModel } from '../../model/price.model';
import { K8sVersionModel } from '../../model/k8s-version.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private notificationService: NzNotificationService,
    private titleService: Title,
    private fb: FormBuilder
  ) {
    this.listOfServicePack = [];
    this.currentDate = new Date();
    this.isSubmitting = false;
    this.isUsingPackConfig = true;
    this.isShowModalCancelUpgrade = true;
    this.listOfK8sVersion = [];
    this.listOfVolumeType = [];
    this.listOfWorkerType = [];
    this.listOfPriceItem = [];
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
      this.getDetailCluster(this.serviceOrderCode);
    });

    this.initForm();
  }

  initForm() {
    this.listFormWorker = this.fb.array([]);

    this.upgradeForm = this.fb.group({
      serviceOrderCode: [null, [Validators.required]],
      workerGroup: this.listFormWorker
    });
  }

  addWorkerGroup(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }

    const index = this.listFormWorker ? this.listFormWorker.length : 0;
    const wg = this.fb.group({
      workerGroupName: [null, [Validators.required, Validators.maxLength(16), this.validateUnique(index), Validators.pattern(KubernetesConstant.WORKERNAME_PATTERN)]],
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

    this.getListPack(this.cloudProfileId);
    this.getListK8sVersion(this.regionId, this.cloudProfileId);
    this.getListWorkerType(this.regionId, this.cloudProfileId);
    this.getListVolumeType(this.regionId, this.cloudProfileId);
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  getDetailCluster(serviceOrderCode: string) {
    this.clusterService.getDetailCluster(serviceOrderCode)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.detailCluster = new KubernetesCluster(r.data);

          this.titleService.setTitle('Chi tiết cluster ' + this.detailCluster.clusterName);
        } else {
          this.notificationService.error("Thất bại", r.message);
        }
      });
  }

  getListPack(cloudProifileId: string) {
    this.clusterService.getListPack(cloudProifileId)
    .subscribe((r: any) => {
      this.listOfServicePack = [];

      if (r && r.code == 200) {
        r.data?.forEach(item => {
          const p = new PackModel(item);
          this.listOfServicePack.push(p);
        });

        this.myCarousel.pointNumbers = Array.from({length: this.listOfServicePack.length}, (_, i) => i + 1);

      } else {
        this.notificationService.error("Thất bại", r.message);
      }
    });
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

  onCalculatePrice() {

  }

  onSelectPackTab() {
    this.chooseItem = null;
    this.isUsingPackConfig = true;
    this.clearFormWorker();

    if (this.detailCluster && this.listOfServicePack) {
      this.currentPackItem = this.listOfServicePack.find(pack => pack.offerId == this.detailCluster.offerId);
    }
  }

  onSelectCustomPackTab() {
    this.chooseItem = null;
    this.isUsingPackConfig = false;
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

  handleShowModalCancelUpgrade() {}

}
