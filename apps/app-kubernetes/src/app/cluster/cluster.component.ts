import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { KubernetesConstant } from '../constants/kubernetes.constant';
import { KubernetesCluster, NetworkingModel, Order, OrderItem } from '../model/cluster.model';
import { K8sVersionModel } from '../model/k8s-version.model';
import { VolumeTypeModel } from '../model/volume-type.model';
import { SubnetModel, VPCNetworkModel } from '../model/vpc-network.model';
import { WorkerTypeModel } from '../model/worker-type.model';
import { ClusterService } from '../services/cluster.service';
import { RegionModel } from '../shared/models/region.model';
import { ProjectModel } from '../shared/models/project.model';
import { VlanService } from '../services/vlan.service';
import { FormSearchNetwork, FormSearchSubnet } from '../model/vlan.model';
import { finalize } from 'rxjs';
import { ShareService } from '../services/share.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['./cluster.component.css'],
})
export class ClusterComponent implements OnInit {

  myform: FormGroup;
  listFormWorkerGroup: FormArray;

  isAutoScaleEnable: boolean;
  isSubmitting: boolean;

  listOfK8sVersion: K8sVersionModel[];
  listOfVPCNetworks: VPCNetworkModel[];
  listOfWorkerType: WorkerTypeModel[];
  listOfVolumeType: VolumeTypeModel[];
  listOfSubnets: SubnetModel[];

  listOfUsageTime = [
    { label: '3 tháng', value: 3 },
    { label: '6 tháng', value: 6 },
    { label: '9 tháng', value: 9 },
    { label: '12 tháng', value: 12 }
  ];

  // order data
  orderData: KubernetesCluster;

  // infrastructure info
  regionId: number;
  projectInfraId: number;
  cloudProfileId: string;
  vlanId: number;

  public DEFAULT_CIDR = KubernetesConstant.DEFAULT_CIDR;
  public DEFAULT_VOLUME_TYPE = KubernetesConstant.DEFAULT_VOLUME_TYPE;
  public DEFAULT_NETWORK_TYPE = KubernetesConstant.DEFAULT_NETWORK_TYPE;

  constructor(
    private fb: FormBuilder,
    private clusterService: ClusterService,
    private modalService: NzModalService,
    private notificationService: NzNotificationService,
    private vlanService: VlanService,
    private router: Router,
    private shareService: ShareService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    this.listOfK8sVersion = [];
    this.listOfSubnets = [];
    this.listOfVPCNetworks = [];
    this.listOfVolumeType = [];
    this.listOfWorkerType = [];
    this.isSubmitting = false;

    this.getCurrentDate();
  }

  ngOnInit(): void {
    this.listFormWorkerGroup = this.fb.array([]);

    this.myform = this.fb.group({
      clusterName: [null,
        [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      kubernetesVersion: [null, [Validators.required]],
      regionId: [null, [Validators.required]],
      projectInfraId: [null, [Validators.required]],
      cloudProfileId: [null, [Validators.required]],

      autoScalingWorker: [false],
      autoHealing: [false],

      // network
      networkType: [this.DEFAULT_NETWORK_TYPE, Validators.required],
      vpcNetwork: [null, Validators.required],
      cidr: [this.DEFAULT_CIDR, Validators.required],
      description: [null, [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9@,-_\\s]*$')]],
      subnet: [null, [Validators.required]],

      workerGroup: this.listFormWorkerGroup,

      // volume
      volumeCloudSize: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      usageTime: [3, [Validators.required]],
      volumeCloudType: ['hdd', [Validators.required]],
    });

    // init worker group
    this.addWorkerGroup();
  }

  addWorkerGroup(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }

    const index = this.listFormWorkerGroup ? this.listFormWorkerGroup.length : 0;
    const wg = this.fb.group({
      workerGroupName: [null, [Validators.required, Validators.maxLength(16), this.validateUnique(index)]],
      nodeNumber: [3, [Validators.required]],
      volumeStorage: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      volumeType: [this.DEFAULT_VOLUME_TYPE, [Validators.required]],
      volumeTypeId: [null, [Validators.required]],
      configType: [null, [Validators.required]],
      configTypeId: [null, [Validators.required]],
      minimumNode: [null],
      maximumNode: [null]
    });
    this.listFormWorkerGroup.push(wg);

    // fill volumeTypeId by default value when add new worker group
    const volumeType = this.listOfVolumeType?.find(item => item.volumeType === this.DEFAULT_VOLUME_TYPE);
    if (volumeType) {
      this.listFormWorkerGroup.at(index).get('volumeTypeId').setValue(volumeType.id);
    }
  }

  removeWorkerGroup(index: number, e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    this.listFormWorkerGroup.removeAt(index);
  }

  getListK8sVersion(regionId: number, cloudProfileName: string) {
    this.listOfK8sVersion = [];
    this.clusterService.getListK8sVersion(regionId, cloudProfileName)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfK8sVersion = r.data;

          // select latest version of kubernetes
          const len = this.listOfK8sVersion?.length;
          const latestVersion: K8sVersionModel = this.listOfK8sVersion?.[len - 1];
          this.myform.get('kubernetesVersion').setValue(latestVersion.k8sVersion);
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

          // for the first time the form is initialized,
          // if data is not already loaded, volumeTypeId will not fill value
          const volumeType = this.listOfVolumeType.find(item => item.volumeType === this.DEFAULT_VOLUME_TYPE);
          this.listFormWorkerGroup.at(0).get('volumeTypeId').setValue(volumeType.id);
        } else {
          this.notificationService.error("Thất bại", r.message);
        }
      });
  }

  getVPCNetwork(regionId: number,cloudProfileName: string) {
    this.clusterService.getVPCNetwork(regionId, cloudProfileName)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfVPCNetworks = r.data;
      }
    });
  }

  formSearchNetwork: FormSearchNetwork = new FormSearchNetwork();
  getVlanNetwork(projectId: number) {
    this.formSearchNetwork.projectId = projectId;
    this.formSearchNetwork.pageSize = 1000;
    this.formSearchNetwork.pageNumber = 0;
    this.formSearchNetwork.region = this.regionId;

    this.vlanService.getVlanNetworks(this.formSearchNetwork)
    .subscribe((r: any) => {
      if (r && r.records) {
        this.listOfVPCNetworks = r.records;
      }
    });
  }

  formSearchSubnet: FormSearchSubnet = new FormSearchSubnet();
  getSubnetByVlanNetwork() {
    this.formSearchSubnet.pageSize = 1000;
    this.formSearchSubnet.pageNumber = 0;
    this.formSearchSubnet.networkId = this.vlanId;
    this.formSearchSubnet.region = this.regionId;

    // clear subnet
    this.myform.get('subnet').setValue(null);

    this.vlanService.getListSubnet(this.formSearchSubnet)
    .subscribe((r: any) => {
      if (r && r.records) {
        this.listOfSubnets = r.records;
      }
    })
  }

  // catch event region change and reload data
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.cloudProfileId = region.cloudId;

    this.getListK8sVersion(this.regionId, this.cloudProfileId);
    this.getListWorkerType(this.regionId, this.cloudProfileId);
    this.getListVolumeType(this.regionId, this.cloudProfileId);

    this.myform.get('regionId').setValue(this.regionId);
    this.myform.get('cloudProfileId').setValue(this.cloudProfileId);
  }

  onProjectChange(project: ProjectModel) {
    this.projectInfraId = project.id;

    this.getVlanNetwork(this.projectInfraId);
    this.myform.get('projectInfraId').setValue(this.projectInfraId);

    // handle reset select box of previous project
    this.myform.get('vpcNetwork').setValue(null);
    this.myform.get('subnet').setValue(null);

  }

  onSelectedVlan(vlanId: number) {
    this.vlanId = vlanId;
    this.getSubnetByVlanNetwork();
  }

  onSelectVolumeType(volumeType: string, index: number) {
    const selectedVolumeType = this.listOfVolumeType.find(item => item.volumeType === volumeType);
    // console.log(selectedVolumeType);
    this.listFormWorkerGroup.at(index).get('volumeTypeId').setValue(selectedVolumeType.id);
  }

  onSelectWorkerType(machineName: string, index: number) {
    const selectedWorkerType = this.listOfWorkerType.find(item => item.machineName === machineName);
    this.listFormWorkerGroup.at(index).get('configTypeId').setValue(selectedWorkerType.id);
  }

  onChangeAdvancedConfig() {
    const isAutoScaleWorker = this.myform.get('autoScalingWorker').value;
    if (isAutoScaleWorker) {
      this.isAutoScaleEnable = true;
      this.addValidateMinimumNode();
      this.addValidateMaximumNode();
    } else {
      this.isAutoScaleEnable = false;
      this.removeValidateMinimumNode();
      this.removeValidateMaximumNode();
    }
  }

  onChangeNodeValue(index: number) {
    const minNode = this.listFormWorkerGroup.at(index).get('minimumNode').value;
    const maxNode = this.listFormWorkerGroup.at(index).get('maximumNode').value;
    if (minNode && maxNode) {
      if (minNode > maxNode) {
        this.listFormWorkerGroup.at(index).get('minimumNode').setErrors({invalid: true});
      } else {
        delete this.listFormWorkerGroup.at(index).get('minimumNode').errors?.invalid;
        this.listFormWorkerGroup.at(index).get('minimumNode').updateValueAndValidity();
      }
    }
  }

  // validator
  addValidateMaximumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      this.listFormWorkerGroup.at(i).get('maximumNode').setValidators([Validators.required]);
      this.listFormWorkerGroup.at(i).get('maximumNode').updateValueAndValidity();
    }
  }

  removeValidateMaximumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      this.listFormWorkerGroup.at(i).get('maximumNode').clearValidators();
      this.listFormWorkerGroup.at(i).get('maximumNode').updateValueAndValidity();
    }
  }

  addValidateMinimumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      this.listFormWorkerGroup.at(i).get('minimumNode').setValidators([Validators.required]);
      this.listFormWorkerGroup.at(i).get('minimumNode').updateValueAndValidity();
    }
  }

  removeValidateMinimumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      this.listFormWorkerGroup.at(i).get('minimumNode').clearValidators();
      this.listFormWorkerGroup.at(i).get('minimumNode').updateValueAndValidity();
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
    this.listFormWorkerGroup.controls.forEach((x, i) => {
      if (index != i)
        (x as FormGroup).get('workerGroupName').updateValueAndValidity()
    })
  }

  // get data
  get clusterName() {
    return this.myform.get('clusterName').value;
  }

  get kubernetesVersion() {
    return this.myform.get('kubernetesVersion').value;
  }

  get regionName() {
    return this.myform.get('reigonId').value;
  }

  get networkType() {
    return this.myform.get('networkType').value;
  }

  get vpcNetwork() {
    return this.myform.get('vpcNetwork').value;
  }

  get cidr() {
    return this.myform.get('cidr').value;
  }

  get subnet() {
    return this.myform.get('subnet').value;
  }

  get volumeCloudSize() {
    return this.myform.get('volumeCloudSize').value;
  }

  get volumeCloudType() {
    return this.myform.get('volumeCloudType').value;
  }

  get usageTime() {
    return this.myform.get('usageTime').value;
  }

  currentDate: string;
  getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = (today.getMonth() + 1).toString(); // Months start at 0
    let dd = today.getDate().toString();

    if (+dd < 10) dd = '0' + dd;
    if (+mm < 10) mm = '0' + mm;

    this.currentDate = dd + '/' + mm + '/' + yyyy;
  }

  syncVPCNetwork() {
    console.log(123);
  }

  syncSubnet() {
    console.log(123);
  }

  onCancelCreate() {
    this.modalService.confirm({
      nzTitle: 'Hủy tạo mới cluster',
      nzContent: 'Cluster của bạn chưa được tạo. <br>Bạn có muốn hủy tạo mới và xóa bản nháp?',
      nzOkText: "Xác nhận",
      nzCancelText: "Hủy",
      nzOnOk: () => this.back2list()
    });
  }

  back2list() {
    this.router.navigate(['/app-kubernetes']);
  }

  isNumber(event) {
    const reg = new RegExp('^[0-9]+$');
    const input = event.key;
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  onSubmitOrder = () => {
    const cluster = this.myform.value;
    const networking: NetworkingModel = new NetworkingModel(null);
    networking.networkType = cluster.networkType;
    networking.vpcNetworkId = cluster.vpcNetwork;
    networking.cidr = cluster.cidr;
    networking.subnet = cluster.subnet;

    cluster.networking = networking;

    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;    // fix test
    data.orderItems = [];

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = 25000000;       // fix test
    orderItem.orderItemQuantity = 1;  // fix test
    orderItem.specificationType = KubernetesConstant.CLUSTER_CREATE_TYPE;
    orderItem.specification = JSON.stringify(cluster);
    orderItem.serviceDuration = this.usageTime;

    data.orderItems = [...data.orderItems, orderItem];

    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: '/app-kubernetes'}});
  }

  onSubmitPayment() {
    const cluster = this.myform.value;
    const networking: NetworkingModel = new NetworkingModel(null);
    networking.networkType = cluster.networkType;
    networking.vpcNetworkId = cluster.vpcNetwork;
    networking.cidr = cluster.cidr;
    networking.subnet = cluster.subnet;

    cluster.networking = networking;

    // console.log(this.myform);
    // console.log({data: cluster});
    this.isSubmitting = true;
    this.clusterService.createNewCluster(cluster)
    .pipe(finalize(() => this.isSubmitting = false))
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.notificationService.success('Thành công', r.message);

        const clusterName = this.myform.get('clusterName').value;
        this.shareService.emitData({
          namespace: r.data,
          clusterName: clusterName
        });

        this.back2list();
      } else {
        this.notificationService.error('Thất bại', r.message);
      }
    });
  }
}
