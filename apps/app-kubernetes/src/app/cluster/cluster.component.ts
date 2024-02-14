import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { K8sVersionModel } from '../model/k8s-version.model';
import { SubnetModel, VPCNetworkModel } from '../model/vpc-network.model';
import { ClusterService } from '../services/cluster.service';
import { WorkerTypeModel } from '../model/worker-type.model';
import { VolumeTypeModel } from '../model/volume-type.model';

@Component({
  selector: 'one-portal-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['./cluster.component.css'],
})
export class ClusterComponent implements OnInit {

  myform: FormGroup;
  listFormWorkerGroup: FormArray;
  selectedInfra: string;

  isAutoScaleEnable: boolean;

  listOfK8sVersion:  K8sVersionModel[];
  listOfVPCNetworks: VPCNetworkModel[];
  listOfWorkerType: WorkerTypeModel[];
  listOfVolumeType: VolumeTypeModel[];
  listOfSubnets: SubnetModel[];

  constructor(
    private fb: FormBuilder,
    private clusterService: ClusterService,
    private modalService: NzModalService,
    private router: Router
  ) {
    this.listOfK8sVersion = [];
    this.listOfSubnets = [];
    this.listOfVPCNetworks = [];
  }

  ngOnInit(): void {
    const cloudProfileName = 'local';
    this.getListK8sVersion(cloudProfileName);
    this.getListWorkerType(cloudProfileName);
    this.getListVolumeType(cloudProfileName);

    this.listFormWorkerGroup = this.fb.array([]);

    this.myform = this.fb.group({
      clusterName: [null,
        [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      kubernetesVersion: [null, [Validators.required]],
      region: [null],

      autoScalingWorker: [false],
      autoHeadling: [false],
      nodeNumber: [3, [Validators.required]],
      networkType: [null, Validators.required],
      vpcNetwork: [null, Validators.required],
      cidr: [null, Validators.required],
      description: [null, [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9@,-_\\s]*$')]],
      subnet: [null, [Validators.required]],

      workerGroup: this.listFormWorkerGroup,
    });

    // init worker group
    this.addWorkerGroup();
  }

  addWorkerGroup(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }

    const wg = this.fb.group({
      workerGroupName: [null, [Validators.required]],
      nodeNumber: [null, [Validators.required]],
      hardDriveStorage: [null, [Validators.required]],
      hardDriveType: ['hdd', [Validators.required]],
      configType: [null, [Validators.required]],
      minimumNode: [null],
      maximumNode: [null]
    });
    this.listFormWorkerGroup.push(wg);
  }

  getListK8sVersion(cloudProfileName: string) {
    this.clusterService.getListK8sVersion(cloudProfileName)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfK8sVersion = r.data;
      }
    });
  }

  getListWorkerType(cloudProfileName: string) {
    this.clusterService.getListWorkerTypes(cloudProfileName)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfWorkerType = r.data;
      }
    })
  }

  getListVolumeType(cloudProfileName: string) {
    this.clusterService.getListVolumeTypes(cloudProfileName)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfVolumeType = r.data;
      }
    });
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

  addValidateMaximumNode() {
    for (let i = 0; i < this.listFormWorkerGroup.length; i++) {
      console.log(1);
      this.listFormWorkerGroup.at(i).get('maximumNode').setValidators([Validators.required]);
      this.listFormWorkerGroup.at(i).get('maximumNode').updateValueAndValidity();
    }
  }

  removeValidateMaximumNode() {
    console.log(2);
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

  removeWorkerGroup(index: number, e: MouseEvent): void {
    e.preventDefault();
    this.listFormWorkerGroup.removeAt(index);
  }

  // get data
  get clusterName() {
    return this.myform.get('clusterName').value;
  }

  get kubernetesVersion() {
    return this.myform.get('kubernetesVersion').value;
  }

  get regionName() {
    return this.myform.get('reigon').value;
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
    if(!reg.test(input)) {
      event.preventDefault();
    }
  }

  onSubmitPayment() {
    const cluster = this.myform.value;
    console.log(this.myform);
    console.log(cluster);
  }

}
