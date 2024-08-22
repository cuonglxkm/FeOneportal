import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { InstancesService } from '../../instances.service';
import { Router } from '@angular/router';
import {
  InstancesModel,
  Network,
  SecurityGroupModel,
  UpdatePortInstance,
} from '../../instances.model';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from '@delon/abc/loading';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'one-portal-network-detail',
  templateUrl: './network-detail.component.html',
  styleUrls: [],
})
export class NetworkDetailComponent implements OnInit {
  selectedProject: any;
  @Input() instancesId: any;
  @Input() isDetail: any;

  @Output() valueChanged = new EventEmitter();

  instancesModel: InstancesModel;
  listSecurityGroup: SecurityGroupModel[] = [];
  selectedSecurityGroup: any[] = [];
  listOfDataNetwork: Network[] = [];
  loading: boolean = true;

  portId: string; //sau chị Sim gán giá trị này cho em nhé để truyền vào param

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.getNetworkAndSecurityGroup();
  }

  getNetworkAndSecurityGroup() {
    this.dataService.getById(this.instancesId, true).subscribe((data: any) => {
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
          this.listOfDataNetwork = dataNetwork.filter(
            (e: Network) => e.isExternal == false
          );
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

  form: FormGroup;
  isVisibleEditPort: boolean = false;
  portSecurity: boolean;
  listSGselected: string[] = [];
  networkEdit: Network = new Network();
  showModalEditPort(data: Network) {
    this.form = new FormGroup({
      securityGroups: new FormControl([], {
        validators: [Validators.required],
      }),
    });
    this.networkEdit = data;
    this.portSecurity = this.networkEdit.port_security_enabled;
    this.listSGselected = this.networkEdit.security_groups;
    this.isVisibleEditPort = true;
  }

  handleOkEditPort() {
    this.isVisibleEditPort = false;
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    let updatePortInstance = new UpdatePortInstance();
    updatePortInstance.portId = this.networkEdit.id;
    updatePortInstance.regionId = this.instancesModel.regionId;
    updatePortInstance.customerId = this.instancesModel.customerId;
    updatePortInstance.vpcId = this.instancesModel.projectId;
    updatePortInstance.securityGroup = this.listSGselected;
    updatePortInstance.portSecurityEnanble = this.portSecurity;
    console.log('Update Port VM', updatePortInstance);
    this.dataService
      .updatePortVM(updatePortInstance)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe({
        next: (data) => {
          this.notification.success(
            '',
            this.i18n.fanyi('app.notify.edit.port.success')
          );
          this.valueChanged.emit(data);
          this.getNetworkAndSecurityGroup();
        },
        error: (e) => {
          this.notification.error(
            '',
            this.i18n.fanyi('app.notify.edit.port.fail')
          );
        },
      });
  }

  handleCancelEditPort() {
    this.isVisibleEditPort = false;
  }

  changeCheckPort() {
    this.listSGselected = [];
    if (this.portSecurity) {
      this.form.setControl(
        'securityGroups',
        new FormControl('', {
          validators: [Validators.required],
        })
      );
    } else {
      this.form.setControl(
        'securityGroups',
        new FormControl('', {
          validators: [],
        })
      );
    }
  }

  navigateToCreate() {
    this.commonService.navigateAdvance('/app-smart-cloud/instances/instances-create', '/app-smart-cloud/instances-advance/instances-create')

    // this.route.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToChangeImage() {
    this.commonService.navigateAdvance('/app-smart-cloud/instances/instances-edit-info/' + this.instancesId, '/app-smart-cloud/instances-advance/instances-edit-info/' + this.instancesId)

    // this.route.navigate([
    //   '/app-smart-cloud/instances/instances-edit-info/' + this.instancesId,
    // ]);
  }
  navigateToEdit() {
    this.commonService.navigateAdvance('/app-smart-cloud/instances/instances-edit/' + this.instancesId, '/app-smart-cloud/instances-advance/instances-edit/' + this.instancesId)
    // this.route.navigate([
    //   '/app-smart-cloud/instances/instances-edit/' + this.instancesId,
    // ]);
  }
  returnPage(): void {
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')
    // this.route.navigate(['/app-smart-cloud/instances']);
  }

  navigateToAllowAddressPair() {
    this.route.navigate(['/app-smart-cloud/allow-address-pair/' + this.portId]);
  }
}
