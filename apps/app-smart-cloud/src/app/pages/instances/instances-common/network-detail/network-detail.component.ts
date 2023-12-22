import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { InstancesService } from '../../instances.service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  InstancesModel,
  Network,
  SecurityGroupModel,
  UpdatePortInstance,
} from '../../instances.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-network-detail',
  templateUrl: './network-detail.component.html',
  styleUrls: [],
})
export class NetworkDetailComponent implements OnInit {
  selectedProject: any;
  @Input() instancesId: any;

  @Output() valueChanged = new EventEmitter();

  instancesModel: InstancesModel;
  listSecurityGroup: SecurityGroupModel[] = [];
  listIPPublicDefault: [{ id: ''; ipAddress: 'Mặc định' }];
  selectedSecurityGroup: any[] = [];
  listOfDataNetwork: Network[] = [];
  updatePortInstance: UpdatePortInstance = new UpdatePortInstance();
  loading: boolean = true;

  portId: string; //sau chị Sim gán giá trị này cho em nhé để truyền vào param

  ngOnInit(): void {
    this.getNetworkAndSecurityGroup();
  }

  getNetworkAndSecurityGroup() {
    this.dataService.getById(this.instancesId, false).subscribe((data: any) => {
      this.instancesModel = data;
      this.dataService
        .getPortByInstance(this.instancesId, this.instancesModel.regionId)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe((dataNetwork: any) => {
          this.listOfDataNetwork = dataNetwork;
          this.cdr.detectChanges();
        });
      this.dataService
        .getAllSecurityGroup(
          this.instancesModel.regionId,
          this.instancesModel.customerId,
          this.instancesModel.projectId
        )
        .subscribe((dataSG: any) => {
          console.log('getAllSecurityGroup', dataSG);
          this.listSecurityGroup = dataSG;
        });
    });
  }

  // onChangeSecurityGroup(even?: any) {
  //   this.updatePortInstance.securityGroup = even;
  // }

  constructor(
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    public message: NzMessageService
  ) {}

  editPort(tpl: TemplateRef<{}>, id: any): void {
    this.selectedSecurityGroup = this.listOfDataNetwork.filter(
      (e) => (e.id = id)
    )[0].security_groups;
    this.modalSrv.create({
      nzTitle: 'Chỉnh sửa Port',
      nzContent: tpl,
      nzOkText: 'Chỉnh sửa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.updatePortInstance.portId = id;
        this.updatePortInstance.regionId = this.instancesModel.regionId;
        this.updatePortInstance.customerId = this.instancesModel.customerId;
        this.updatePortInstance.vpcId = this.instancesModel.projectId;
        this.updatePortInstance.securityGroup = this.selectedSecurityGroup;
        this.updatePortInstance.portSecurityEnanble = true;
        console.log('Update Port VM', this.updatePortInstance);
        this.dataService.updatePortVM(this.updatePortInstance).subscribe();
        this.message.success('Chỉnh sửa port thành công!');
        this.route.navigate(['/app-smart-cloud/instances']);
      },
    });
  }

  projectChange(project: any) {
    this.valueChanged.emit(project);
  }

  navigateToCreate() {
    this.route.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.instancesId,
    ]);
  }
  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.instancesId,
    ]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  navigateToAllowAddressPair() {
    this.route.navigate(['/app-smart-cloud/allow-address-pair/' + this.portId]);
  }
}
