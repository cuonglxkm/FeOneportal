import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NguCarouselConfig } from '@ngu/carousel';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'one-portal-create-kafka',
  templateUrl: './create-kafka.component.html',
  styleUrls: ['./create-kafka.component.css'],
})
export class CreateKafkaComponent implements OnInit {

  myform: FormGroup;
  listFormWorkerGroup: FormArray;
  selectedInfra: string;

  isAutoScaleEnable: boolean;

  listOfCIDR: any[];

  // infrastructure info
  region: number;
  cloudProfileName: string;

  carouselItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  chooseitem:any;
  effect = 'scrollx';

  carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 3, lg: 3, all: 0 },
    slide: 3,
    speed: 250,
    point: {
      visible: true
    },
    load: 2,
    velocity: 0,
    touch: true,
  }

  constructor(
    private fb: FormBuilder,
    private modalService: NzModalService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.listFormWorkerGroup = this.fb.array([]);
    this.myform = this.fb.group({
      kafkaName: [null,
        [Validators.required, Validators.pattern("^[a-zA-Z0-9_-]*$"), Validators.minLength(5), Validators.maxLength(50)]],
      kubernetesVersion: [null, [Validators.required]],
      region: [null, [Validators.required]],
      autoScalingWorker: [false],
      autoHealing: [false],
      version: [null],
      vpcNetwork: [null, Validators.required],
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

    const index = this.listFormWorkerGroup ? this.listFormWorkerGroup.length : 0;
    const wg = this.fb.group({
      workerGroupName: [null, [Validators.required, Validators.maxLength(16), this.validateUnique(index)]],
      nodeNumber: [3, [Validators.required]],
      volumeStorage: [null, [Validators.required, Validators.min(20), Validators.max(1000)]],
      volumeTypeId: [null, [Validators.required]],
      configType: [null, [Validators.required]],
      configTypeId: [null, [Validators.required]],
      minimumNode: [null],
      maximumNode: [null],
    });
    this.listFormWorkerGroup.push(wg);
  }

  handlechoose(item:any) {
    console.log("xu ly chon");
     this.chooseitem = item;
  }

  clicktab(){
    console.log("click tabs");
    
    this.chooseitem = null;
  }

  get kafkaName() {
    return this.myform.get('kafkaName')?.value;
  }

  get kafkaVersion() {
    return this.myform.get('version')?.value;
  }

  getListK8sVersion(cloudProfileName: string) {
    // this.clusterService.getListK8sVersion(cloudProfileName)
    //   .subscribe((r: any) => {
    //     if (r && r.code == 200) {
    //       this.listOfK8sVersion = r.data;

    //       // select latest version of kubernetes
    //       const len = this.listOfK8sVersion?.length;
    //       const latestVersion: K8sVersionModel = this.listOfK8sVersion?.[len - 1];
    //       this.myform.get('kubernetesVersion').setValue(latestVersion.k8sVersion);
    //     }
    //   });
  }

  getListWorkerType(cloudProfileName: string) {
    // this.clusterService.getListWorkerTypes(cloudProfileName)
    //   .subscribe((r: any) => {
    //     if (r && r.code == 200) {
    //       this.listOfWorkerType = r.data;
    //     }
    //   })
  }

  getListVolumeType(cloudProfileName: string) {
    // this.clusterService.getListVolumeTypes(cloudProfileName)
    //   .subscribe((r: any) => {
    //     if (r && r.code == 200) {
    //       this.listOfVolumeType = r.data;
    //     }
    //   });
  }

  getVPCNetwork(cloudProfileName: string) {
    // this.clusterService.getVPCNetwork(cloudProfileName)
    // .subscribe((r: any) => {
    //   if (r && r.code == 200) {
    //     this.listOfVPCNetworks = r.data;
    //   }
    // });
  }


  onSelectVolumeType(volumeType: string, index: number) {
    // const selectedVolumeType = this.listOfVolumeType.find(item => item.volumeType === volumeType);
    // console.log(selectedVolumeType);
    // this.listFormWorkerGroup.at(index).get('volumeTypeId').setValue(selectedVolumeType.id);
  }

  onSelectWorkerType(machineName: string, index: number) {
    // const selectedWorkerType = this.listOfWorkerType.find(item => item.machineName === machineName);
    // console.log(selectedWorkerType);
    // this.listFormWorkerGroup.at(index).get('configTypeId').setValue(selectedWorkerType.id);
  }

  removeWorkerGroup(index: number, e: MouseEvent): void {
    e.preventDefault();
    this.listFormWorkerGroup.removeAt(index);
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

  onSubmitPayment() {
    const cluster = this.myform.value;
    console.log({ data: cluster });
    // this.clusterService.testCreateCluster(cluster)
    // .subscribe((r: any) => {
    //   if (r && r.code == 200) {
    //     console.log({r: r});
    //   }
    // });
  }

}
