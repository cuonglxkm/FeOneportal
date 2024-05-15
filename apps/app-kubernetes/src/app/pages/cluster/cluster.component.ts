import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { overlapCidr } from "cidr-tools";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, catchError, finalize, forkJoin, map } from 'rxjs';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { CreateClusterReqDto, KubernetesCluster, NetworkingModel, Order, OrderItem } from '../../model/cluster.model';
import { K8sVersionModel } from '../../model/k8s-version.model';
import { PackModel } from '../../model/pack.model';
import { PriceModel } from '../../model/price.model';
import { FormSearchNetwork, FormSearchSubnet, NetWorkModel, Subnet } from '../../model/vlan.model';
import { VolumeTypeModel } from '../../model/volume-type.model';
import { WorkerTypeModel } from '../../model/worker-type.model';
import { ClusterService } from '../../services/cluster.service';
import { ShareService } from '../../services/share.service';
import { VlanService } from '../../services/vlan.service';
import { ProjectModel } from '../../shared/models/project.model';
import { RegionModel } from '../../shared/models/region.model';
import { User } from '../../shared/models/user.model';
import { UserInfo } from '../../model/user.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  listOfVPCNetworks: NetWorkModel[];
  listOfWorkerType: WorkerTypeModel[];
  listOfVolumeType: VolumeTypeModel[];
  listOfSubnets: Subnet[];
  listOfServicePack: PackModel[];
  listOfPriceItem: PriceModel[];

  // order data
  orderData: KubernetesCluster;

  // infrastructure info
  regionId: number;
  projectInfraId: number;
  cloudProfileId: string;
  vlanId: number;

  expiryDate: number;
  isChangeInfo: boolean;

  public DEFAULT_CIDR = KubernetesConstant.DEFAULT_CIDR;
  public DEFAULT_SERVICE_CIDR = KubernetesConstant.DEFAULT_SERVICE_CIDR;
  public DEFAULT_VOLUME_TYPE = KubernetesConstant.DEFAULT_VOLUME_TYPE;
  public DEFAULT_NETWORK_TYPE = KubernetesConstant.DEFAULT_NETWORK_TYPE;

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
    private fb: FormBuilder,
    private clusterService: ClusterService,
    private modalService: NzModalService,
    private notificationService: NzNotificationService,
    private vlanService: VlanService,
    private router: Router,
    private shareService: ShareService,
    private cdr: ChangeDetectorRef,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    this.listOfK8sVersion = [];
    this.listOfSubnets = [];
    this.listOfVPCNetworks = [];
    this.listOfVolumeType = [];
    this.listOfWorkerType = [];
    this.listOfServicePack = [];
    this.isSubmitting = false;
    this.isChangeInfo = false;

    this.getCurrentDate();
    this.getListPriceItem();
  }

  ngOnInit(): void {
    this.listFormWorkerGroup = this.fb.array([]);

    this.myform = this.fb.group({
      clusterName: [null,
        [Validators.required, Validators.pattern(KubernetesConstant.CLUTERNAME_PATTERN), Validators.minLength(5), Validators.maxLength(50)]],
      kubernetesVersion: [null, [Validators.required]],
      regionId: [null, [Validators.required]],
      projectId: [null, [Validators.required]],
      cloudProfileId: [null, [Validators.required]],
      tenant: [null],

      // network
      networkType: [this.DEFAULT_NETWORK_TYPE, Validators.required],
      vpcNetwork: [null, Validators.required],
      cidr: [this.DEFAULT_CIDR, [Validators.required, Validators.pattern(KubernetesConstant.IPV4_PATTERN)]],
      serviceCidr: [this.DEFAULT_SERVICE_CIDR, [Validators.required, Validators.pattern(KubernetesConstant.IPV4_PATTERN)]],
      description: [null, [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9@,-_\\s]*$')]],
      subnet: [null, [Validators.required]],
      subnetId: [null, [Validators.required]],
      networkCloudId: [null, [Validators.required]],
      subnetCloudId: [null, [Validators.required]],

      workerGroup: this.listFormWorkerGroup,

      // volume
      // volumeCloudSize: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      // volumeCloudType: ['hdd', [Validators.required]],
      usageTime: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
    });

    // display expiry time
    const usageTimeInit = this.myform.get('usageTime').value;
    this.onSelectUsageTime(usageTimeInit);
    this.getUserInfo(this.tokenService.get()?.userId);
  }

  addWorkerGroup(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }

    const index = this.listFormWorkerGroup ? this.listFormWorkerGroup.length : 0;
    const wg = this.fb.group({
      workerGroupName: [null, [Validators.required, Validators.maxLength(16), this.validateUnique(index), Validators.pattern(KubernetesConstant.WORKERNAME_PATTERN)]],
      nodeNumber: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      volumeStorage: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      volumeType: [this.DEFAULT_VOLUME_TYPE, [Validators.required]],
      volumeTypeId: [null, [Validators.required]],
      volumeTypeName: [this.defaultVolumeTypeName],
      configType: [null, [Validators.required]],
      configTypeId: [null, [Validators.required]],
      autoScalingWorker: [false, Validators.required],
      autoHealing: [true, Validators.required],
      minimumNode: [null],
      maximumNode: [null],
      cpu: [null],
      ram: [null]
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
    this.onCalculatePrice();
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
          this.myform.get('kubernetesVersion').setValue(latestVersion?.k8sVersion);
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

  defaultVolumeTypeName: string;
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

    if (projectId && this.regionId) {
      this.vlanService.getVlanNetworks(this.formSearchNetwork)
      .subscribe((r: any) => {
        if (r && r.records) {
          this.listOfVPCNetworks = r.records;
        }
      });
    }
  }

  getSubnetByVlanNetwork() {
    this.formSearchSubnet.pageSize = 1000;
    this.formSearchSubnet.pageNumber = 0;
    this.formSearchSubnet.networkId = this.vlanId;
    this.formSearchSubnet.region = this.regionId;
    this.formSearchSubnet.vpcId = this.projectInfraId;
    this.formSearchSubnet.customerId = this.tokenService.get()?.userId;

    this.vlanService.getListSubnet(this.formSearchSubnet).pipe(
      map(r => r.records),
      catchError(response => {
        console.error("fail to get list subnet: {}", response);
        return EMPTY;
      })
    )
    .subscribe((data: any) => {
      this.listOfSubnets = data;
    });
  }

  userInfo: UserInfo;
  getUserInfo(userId: number) {
    this.clusterService.getUserInfo(userId)
    .subscribe((r: any) => {
      this.userInfo = r;
    });
  }

  getListPack(cloudProifileId: string) {
    this.clusterService.getListPack(cloudProifileId)
    .subscribe((r: any) => {
      this.listOfServicePack = [];
      this.myCarousel.reset();

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

  getListPriceItem() {
    this.clusterService.getListPriceItem()
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfPriceItem = r.data;
        this.initPrice();
      } else {
        this.notificationService.error("Thất bại", r.message);
      }
    });
  }

  priceOfCpu: number;
  priceOfRam: number;
  priceOfSsd: number;
  priceOfHdd: number;
  initPrice() {
    this.listOfPriceItem.forEach(data => {
      switch (data.item) {
        case 'cpu':
          this.priceOfCpu = data.price;
          break;
        case 'ram':
          this.priceOfRam = data.price;
          break;
        case 'storage_ssd':
          this.priceOfSsd = data.price;
          break;
        case 'storage_hdd':
          this.priceOfHdd = data.price;
          break;
      }
    });
  }

  totalRam: number;
  totalCpu: number;
  totalStorage: number;
  onCalculatePrice() {
    this.totalPrice = 0;
    this.workerPrice = 0;
    this.totalCpu = 0; this.totalRam = 0; this.totalStorage = 0;

    const wg = this.myform.get('workerGroup').value;
    for (let i = 0; i < wg.length; i++) {
      const cpu = wg[i].cpu ? wg[i].cpu : 0;
      const ram = wg[i].ram ? wg[i].ram : 0;
      const storage = +wg[i].volumeStorage ? +wg[i].volumeStorage : 0;
      const autoScale = wg[i].autoScalingWorker;
      let nodeNumber: number;
      if (autoScale) {
        // TODO: ...

      } else {
        nodeNumber = wg[i].nodeNumber ? wg[i].nodeNumber : 0;
      }

      this.totalCpu += nodeNumber * cpu;
      this.totalRam += nodeNumber * ram;
      this.totalStorage += nodeNumber * storage;
    }

    this.workerPrice = this.priceOfCpu * this.totalCpu + this.priceOfRam * this.totalRam + this.priceOfSsd * this.totalStorage;
    this.totalPrice = this.workerPrice + this.volumePrice;
  }

  // catch event region change and reload data
  regionName: string;
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.regionName = region.regionDisplayName;
    // this.cloudProfileId = region.cloudId;
    this.cloudProfileId = KubernetesConstant.OPENSTACK_LABEL;

    this.getListK8sVersion(this.regionId, this.cloudProfileId);
    this.getListWorkerType(this.regionId, this.cloudProfileId);
    this.getListVolumeType(this.regionId, this.cloudProfileId);
    this.getListPack(this.cloudProfileId);

    this.myform.get('regionId').setValue(this.regionId);
    this.myform.get('cloudProfileId').setValue(this.cloudProfileId);
  }

  onProjectChange(project: ProjectModel) {
    this.projectInfraId = project.id;
    this.getVlanNetwork(this.projectInfraId);

    this.myform.get('projectId').setValue(this.projectInfraId);
    this.myform.get('tenant').setValue(project.projectName);

    // handle reset select box of previous project
    this.myform.get('vpcNetwork').setValue(null);
    this.myform.get('subnet').setValue(null);

  }

  vlanCloudId: string;
  mapOfSubnetByNetwork = new Map<string, string[]>();
  formSearchSubnet: FormSearchSubnet = new FormSearchSubnet();
  onSelectedVlan(vlanId: number) {
    this.vlanId = vlanId;
    if (this.vlanId) {
      // this.getSubnetByVlanNetwork();
      let vlan = this.listOfVPCNetworks.find(item => item.id == vlanId);
      this.vlanCloudId = vlan.cloudId;

      this.formSearchSubnet.pageSize = 1000;
      this.formSearchSubnet.pageNumber = 0;
      this.formSearchSubnet.networkId = this.vlanId;
      this.formSearchSubnet.region = this.regionId;
      this.formSearchSubnet.vpcId = this.projectInfraId;
      this.formSearchSubnet.customerId = this.tokenService.get()?.userId;
      let subnetObs = this.vlanService.getListSubnet(this.formSearchSubnet);
      let subnetUsedObs = this.clusterService.getSubnetByNamespaceAndNetwork(this.projectInfraId, vlanId);

      // clear subnet
      this.myform.get('subnet').setValue(null);

      forkJoin({subnetObs, subnetUsedObs}).subscribe(data => {
        this.listOfSubnets = data['subnetObs'].records;
        this.mapOfSubnetByNetwork = new Map(Object.entries(data['subnetUsedObs'].data));
      });
    }
  }

  subnetAddress: string;
  onSelectSubnet(subnetId: number) {
    // check subnet
    const subnet = this.listOfSubnets.find(item => item.id == subnetId);
    if (subnet != null) {
      const selectedVpcNetworkId = this.myform.get('vpcNetwork').value;
      this.subnetAddress = subnet.subnetAddressRequired;

      for (let [k, v] of this.mapOfSubnetByNetwork.entries()) {
        let subnetUsedArr: string[] = v;
        if (subnetUsedArr.includes(this.subnetAddress) && selectedVpcNetworkId != k) {
          this.myform.get('subnet').setErrors({usedSubnet: true});
        } else {
          delete this.myform.get('subnet').errors?.usedSubnet;
        }
      }
      this.myform.get('subnetId').setValue(subnetId);
      this.myform.get('networkCloudId').setValue(subnet.networkCloudId);
      this.myform.get('subnetCloudId').setValue(subnet.subnetCloudId);
    }
  }

  onSelectVolumeType(volumeType: string, index: number) {
    const selectedVolumeType = this.listOfVolumeType.find(item => item.volumeType === volumeType);
    // console.log(selectedVolumeType);
    this.listFormWorkerGroup.at(index).get('volumeTypeId').setValue(selectedVolumeType.id);
  }

  onSelectWorkerType(machineName: string, index: number) {
    const selectedWorkerType = this.listOfWorkerType.find(item => item.machineName === machineName);
    this.listFormWorkerGroup.at(index).get('configTypeId').setValue(selectedWorkerType.id);
    this.listFormWorkerGroup.at(index).get('cpu').setValue(selectedWorkerType.cpu);
    this.listFormWorkerGroup.at(index).get('ram').setValue(selectedWorkerType.ram);

    // calcalate price
    this.onCalculatePrice();
  }

  onInputPodCidrAndSubnet() {
    const cidrValue = this.myform.get('cidr').value;
    const subnetValue = this.myform.get('subnet').value;
    if (cidrValue && subnetValue) {

    }

  }

  onChangeAdvancedConfig(index: number) {
    const isAutoScaleWorker = this.isAutoScaleAtIndex(index);
    if (isAutoScaleWorker) {
      this.isAutoScaleEnable = true;
      this.addValidateMinimumNode(index);
      this.addValidateMaximumNode(index);
    } else {
      this.isAutoScaleEnable = false;
      this.removeValidateMinimumNode(index);
      this.removeValidateMaximumNode(index);
    }
  }

  onSelectUsageTime(event: any) {
    if (event) {
      let d = new Date();
      d.setDate(d.getDate() + Number(event) * 30);
      this.expiryDate = d.getTime();
    }
  }

  isAutoScaleAtIndex(index: number) {
    return this.listFormWorkerGroup.at(index).get('autoScalingWorker').value;
  }

  onChangeNodeValue(index: number) {
    const minNode = this.listFormWorkerGroup.at(index).get('minimumNode').value;
    const maxNode = this.listFormWorkerGroup.at(index).get('maximumNode').value;
    if (minNode && maxNode) {
      if (+minNode > +maxNode) {
        this.listFormWorkerGroup.at(index).get('minimumNode').setErrors({invalid: true});
      } else {
        delete this.listFormWorkerGroup.at(index).get('minimumNode').errors?.invalid;
        this.listFormWorkerGroup.at(index).get('minimumNode').updateValueAndValidity();
      }
    }
    console.log(this.listFormWorkerGroup.at(0).get('workerGroupName').value);
  }

  onSelectPackTab() {
    this.chooseItem = null;
    this.isUsingPackConfig = true;
    this.clearFormWorker();
  }

  onSelectCustomPackTab() {
    this.chooseItem = null;
    this.isChangeInfo = true;
    this.isUsingPackConfig = false;
    this.clearFormWorker();
    this.addWorkerGroup();
  }

  workerPrice: number;
  volumePrice: number;
  totalPrice: number;
  offerId: number;
  chooseItem: PackModel;
  isUsingPackConfig: boolean = true;
  onChoosePack(item: PackModel) {
    this.chooseItem = item;
    this.isChangeInfo = true;
    this.isUsingPackConfig = true;

    if (this.chooseItem) {
      // this.myform.get('volumeCloudSize').setValue(this.chooseItem.volumeStorage);
      // this.myform.get('volumeCloudType').setValue(this.volumeCloudType);

      this.clearFormWorker();

      // add worker group
      const index = this.listFormWorkerGroup ? this.listFormWorkerGroup.length : 0;
      let wgf = this.fb.group({
        workerGroupName: [KubernetesConstant.DEFAULT_WORKER_NAME, [Validators.required, Validators.maxLength(16), this.validateUnique(index), Validators.pattern('^[a-z0-9-_]*$')]],
        nodeNumber: [this.chooseItem.workerNode],
        volumeStorage: [this.chooseItem.rootStorage],
        volumeType: [this.chooseItem.rootStorageType],
        volumeTypeId: [this.chooseItem.volumeTypeId],
        configType: [this.chooseItem.machineType],
        configTypeId: [this.chooseItem.machineTypeId],
        autoScalingWorker: [false],
        autoHealing: [true],
        minimumNode: [null],
        maximumNode: [null],
        cpu: [this.chooseItem.cpu],
        ram: [this.chooseItem.ram]
      });

      this.listFormWorkerGroup.push(wgf);

    }

    // get price
    const itemPack = this.listOfServicePack.find(pack => pack.packId == item.packId);
    this.workerPrice = itemPack.price;
    // this.volumePrice = itemPack.volume;
    this.totalPrice = itemPack.price;
    this.offerId = itemPack.offerId;
  }

  clearFormWorker() {
    while (this.listFormWorkerGroup.length != 0) {
      this.listFormWorkerGroup.removeAt(0);
    }

    this.workerPrice = 0;
    this.volumePrice = 0;
    this.totalPrice = 0;
  }

  onInputUsage(event: any) {
    if (event) {
      // is number
      const numberReg = new RegExp('^[0-9]+$');
      const input = event.key;
      if (!numberReg.test(input)) {
        event.preventDefault();
      }
    }
  }

  // check overlapse podcidr and subnet
  checkOverLapseIP() {
    let cidr = this.myform.get('cidr').value;
    let subnet = this.subnetAddress;

    const reg = new RegExp(KubernetesConstant.CIDR_PATTERN);
    if (!reg.test(cidr)) return;

    if (cidr && subnet) {
      if (overlapCidr(cidr, subnet)) {
        this.myform.get('cidr').setErrors({overlap: true});
      } else {
        delete this.myform.get('cidr').errors?.overlap;
      }

      if (overlapCidr(cidr, KubernetesConstant.CIDR_CHECK)) {
        this.myform.get('cidr').setErrors({cidr_used: true});
      } else {
        delete this.myform.get('cidr').errors?.cidr_used;
      }
    }
  }

  // check overlapse servicecidr and podcidr
  checkOverlapPodCidr() {
    let podCidr = this.myform.get('cidr').value;
    let serviceCidr = this.myform.get('serviceCidr').value;
    let subnet = this.subnetAddress;

    const reg = new RegExp(KubernetesConstant.CIDR_PATTERN);
    if (!reg.test(podCidr) || !reg.test(serviceCidr)) return;

    if (podCidr && serviceCidr) {
      if (overlapCidr(podCidr, serviceCidr)) {
        this.myform.get('serviceCidr').setErrors({overlapPodCidr: true});
      } else {
        delete this.myform.get('serviceCidr').errors?.overlapPodCidr;
      }

      if (overlapCidr(serviceCidr, subnet)) {
        this.myform.get('serviceCidr').setErrors({overlapSubnet: true});
      } else {
        delete this.myform.get('serviceCidr').errors?.overlapSubnet;
      }
    }
  }

  onValidateIP(ip: string, control: string) {
    let tmp: string[] = ip?.split('.');
    if (ip && (tmp[2] != '0' || tmp[3] != '0')) {
      this.myform.get(control).setErrors({invalid: true});
      return;
    } else {
      delete this.myform.get(control).errors?.invalid;
    }
  }

  // validator
  addValidateMaximumNode(index: number) {
    this.listFormWorkerGroup.at(index).get('maximumNode').setValidators([Validators.required, Validators.min(1), Validators.max(10)]);
    this.listFormWorkerGroup.at(index).get('maximumNode').updateValueAndValidity();
  }

  removeValidateMaximumNode(index: number) {
    this.listFormWorkerGroup.at(index).get('maximumNode').clearValidators();
    this.listFormWorkerGroup.at(index).get('maximumNode').updateValueAndValidity();
  }

  addValidateMinimumNode(index: number) {
    this.listFormWorkerGroup.at(index).get('minimumNode').setValidators([Validators.required, Validators.min(1), Validators.max(10)]);
    this.listFormWorkerGroup.at(index).get('minimumNode').updateValueAndValidity();
  }

  removeValidateMinimumNode(index: number) {
    this.listFormWorkerGroup.at(index).get('minimumNode').clearValidators();
    this.listFormWorkerGroup.at(index).get('minimumNode').updateValueAndValidity();
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

  get networkType() {
    return this.myform.get('networkType').value;
  }

  get vpcNetwork() {
    let vpcId = this.myform.get('vpcNetwork').value;
    let vpc = this.listOfVPCNetworks.find(item => item.id == vpcId);
    if (vpc) return vpc.name;
  }

  get cidr() {
    return this.myform.get('cidr').value + '/16';
  }

  get serviceCidr() {
    return this.myform.get('serviceCidr').value + '/16';
  }

  get subnet() {
    const subnetId = this.myform.get('subnet').value;
    let subnet = this.listOfSubnets.find(item => item.id == subnetId);
    return subnet?.subnetAddressRequired;
  }

  // get volumeCloudSize() {
  //   return this.myform.get('volumeCloudSize').value;
  // }

  // get volumeCloudType() {
  //   return this.myform.get('volumeCloudType').value;
  // }

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

  refreshVPCNetwork() {
    this.getVlanNetwork(this.projectInfraId);
  }

  refreshSubnet() {
    this.getSubnetByVlanNetwork();
  }

  showModalCancelCreate: boolean = false;
  handleShowModalCancelCreate() {
    this.showModalCancelCreate = true;
  }

  handleCancelModalCancelCreate() {
    this.showModalCancelCreate = false;
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

  validateForm() {
    for (const i in this.myform.controls) {
      this.myform.controls[i].markAsDirty();
      this.myform.controls[i].updateValueAndValidity();
    }
  }

  validateClusterInfo = () => {
    this.validateForm();

    const cluster = this.myform.value;
    const networking: NetworkingModel = new NetworkingModel(null);
    networking.networkType = cluster.networkType;
    networking.vpcNetworkId = cluster.vpcNetwork;
    networking.cidr = cluster.cidr + '/16';
    networking.subnet = this.subnetAddress + '@' + this.vlanCloudId;
    networking.subnetId = cluster.subnetId;
    networking.subnetCloudId = cluster.subnetCloudId;
    networking.networkCloudId = cluster.networkCloudId;
    networking.serviceCidr = cluster.serviceCidr + '/16';

    cluster.networking = networking;
    cluster.serviceType = KubernetesConstant.K8S_TYPE_ID;
    cluster.offerId = this.offerId;
    cluster.cloudProfileId = KubernetesConstant.OPENSTACK_LABEL;
    cluster.totalRam = this.totalRam;
    cluster.totalCpu = this.totalCpu;
    cluster.totalStorage = this.totalStorage;
    cluster.serviceName = cluster.clusterName;
    cluster.jsonData = JSON.stringify({
      Id: this.userInfo.id,
      UserName: this.userInfo.name,
      PhoneNumber: this.userInfo.phoneNumber,
      UserEmail: this.userInfo.email
    });

    // this.onSubmitOrder(cluster);

    const data: CreateClusterReqDto = new CreateClusterReqDto(cluster);
    // console.log({data: data});
    // console.log({cluster: cluster});
    this.isSubmitting = true;
    this.clusterService.validateClusterInfo(data)
    .pipe(finalize(() => this.isSubmitting = false))
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.onSubmitOrder(cluster);
      } else {
        this.isSubmitting = false;
        this.notificationService.error("Thất bại", r.message);
        this.cdr.detectChanges();
      }
    });
  }

  onSubmitOrder = (cluster) => {
    const data: Order = new Order();
    const userId = this.tokenService.get()?.userId;
    data.customerId = userId;
    data.createdByUserId = userId;
    data.orderItems = [];

    const orderItem: OrderItem = new OrderItem();
    orderItem.price = this.totalPrice;
    orderItem.orderItemQuantity = 1;
    orderItem.specificationType = KubernetesConstant.CLUSTER_CREATE_TYPE;
    orderItem.specification = JSON.stringify(cluster);
    orderItem.serviceDuration = this.usageTime;

    data.orderItems = [...data.orderItems, orderItem];

    let returnPath = window.location.pathname;

    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: data, path: returnPath}});
  }

  onCreateCluster() {
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

        this.router.navigate(['/app-kubernetes']);

      } else {
        this.notificationService.error('Thất bại', r.message);
      }
    });
  }
}
