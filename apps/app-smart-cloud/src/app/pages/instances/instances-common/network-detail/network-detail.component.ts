import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { InstancesService } from '../../instances.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesModel, SecurityGroupModel } from '../../instances.model';
import { da } from 'date-fns/locale';
class Network {
  name?: string = 'pri_network';
  mac?: string = '';
  ip?: string = '';
  status?: string = '';
}

@Component({
  selector: 'one-portal-network-detail',
  templateUrl: './network-detail.component.html',
  styleUrls: [],
})
export class NetworkDetailComponent implements OnInit, OnChanges {
  selectedProject: any;
  @Input() instancesId: any;
  @Input() listOfDataNetwork: any;

  @Output() valueChanged = new EventEmitter();

  instancesModel: InstancesModel;
  listSecurityGroup: SecurityGroupModel[] = [];
  listIPPublicDefault: [{ id: ''; ipAddress: 'Mặc định' }];
  selectedSecurityGroup: any[] = [];

  portId: string; //sau chị Sim gán giá trị này cho em nhé để truyền vào param

  ngOnInit(): void {
    this.getAllSecurityGroup();
    this.loadList();
  }

  getAllSecurityGroup() {
    this.dataService
      .getById(this.instancesId, false)
      .subscribe(async (data: any) => {
        this.instancesModel = data;
        this.dataService
          .getAllSecurityGroup(
            this.instancesModel.regionId,
            this.instancesModel.customerId,
            this.instancesModel.projectId
          )
          .subscribe((data: any) => {
            console.log('getAllSecurityGroup', data);
            this.listSecurityGroup = data;
            //this.selectedSecurityGroup.push(this.listSecurityGroup[0]);
          });
      });
  }

  onChangeSecurityGroup(even?: any) {
    console.log(even);
    console.log('selectedSecurityGroup', this.selectedSecurityGroup);
  }

  constructor(
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private router: ActivatedRoute,
    public message: NzMessageService,
    private renderer: Renderer2
  ) {}

  editPort(tpl: TemplateRef<{}>): void {
    this.modalSrv.create({
      nzTitle: 'Chỉnh sửa Port',
      nzContent: tpl,
      nzOkText: 'Chỉnh sửa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        if (1 == 1) {
          this.message.success('Chỉnh sửa port thành công');
        } else {
          this.message.error('Chỉnh sửa port không thành công!');
        }
      },
    });
  }

  projectChange(project: any) {
    this.valueChanged.emit(project);
  }

  loadList() {
    // this.dataService.get(this.regionId).subscribe(data => {
    //   console.log(data);
    //   this.listProject = data;
    // }, error => {
    //   this.listProject = [];
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.regionId) {
      this.loadList();
    }
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
