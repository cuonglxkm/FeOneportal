import { Component, Inject, OnInit } from '@angular/core';
import { EditSizeMemoryVolumeDTO, VolumeDTO } from '../../../../shared/dto/volume.dto';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { InstancesModel } from '../../../instances/instances.model';
import { EditSizeVolumeModel } from '../../../../shared/models/volume.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VolumeService } from '../../../../shared/services/volume.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesService } from '../../../instances/instances.service';
import {
  ProjectModel,
  RegionModel,
} from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'one-portal-resize-volume-vpc',
  templateUrl: './resize-volume-vpc.component.html',
  styleUrls: ['./resize-volume-vpc.component.less']
})
export class ResizeVolumeVpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  volumeInfo: VolumeDTO;
  oldSize: number;
  expiryTime: any;
  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
    storage: FormControl<number>
    radio: FormControl<any>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]+$/), this.duplicateNameValidator.bind(this)]],
    description: ['', Validators.maxLength(700)],
    storage: [1, [Validators.required, Validators.pattern(/^[0-9]*$/), this.checkQuota.bind(this)]],
    radio: ['']
  });

  nameList: string[] = [];

  volumeId: number;

  isLoading = false;

  iops: number;

  selectedValueRadio = 'ssd';

  isVisibleConfirmEdit: boolean = false;

  volumeStatus: Map<String, string>;

  listVMs: string = '';

  isVisibleConfirm: boolean = false;
  isLoadingConfirm: boolean = false;

  sizeInCloudProject: SizeInCloudProject = new SizeInCloudProject();

  remaining: number;


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeService: VolumeService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: NonNullableFormBuilder,
              private notification: NzNotificationService,
              private instanceService: InstancesService,
              private projectService: ProjectService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', this.i18n.fanyi('app.status.running'));
    this.volumeStatus.set('ERROR', this.i18n.fanyi('app.status.error'));
    this.volumeStatus.set('SUSPENDED', this.i18n.fanyi('app.status.suspend'));

  }

  checkQuota(control) {
    const value = control.value;
    if (this.remaining < value) {
      return { notEnough: true };
    } else {
      return null;
    }
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/volumes']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
  }

  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/volumes']);
    //
  }

  submitForm() {
    console.log(this.validateForm.getRawValue());
    console.log(this.validateForm.valid);
    if (this.validateForm.valid) {
      this.nameList = [];
      this.doEditSizeVolume();
    }
  }

  goBack(): void {
    this.router.navigate(['/app-smart-cloud/volume/detail/' + this.volumeId]);
  }

  instance: InstancesModel = new InstancesModel();

  getInstanceById(id) {
    this.instanceService.getInstanceById(id).subscribe(data => {
      this.instance = data;
    });
  }

  getVolumeById(idVolume: number) {
    this.volumeService.getVolumeById(idVolume).subscribe(data => {
      if (data !== undefined && data != null) {
        this.volumeInfo = data;
        this.oldSize = data.sizeInGB;
        this.validateForm.controls.name.setValue(data.name);
        this.validateForm.controls.storage.setValue(data.sizeInGB);
        this.validateForm.controls.description.setValue(data.description);
        this.selectedValueRadio = data.volumeType;
        this.validateForm.controls.radio.setValue(data.volumeType);

        if (this.volumeInfo?.instanceId != null) {
          this.getInstanceById(this.volumeInfo?.instanceId);
        }

        if (this.volumeInfo?.attachedInstances != null) {
          this.volumeInfo?.attachedInstances?.forEach(item => {
            this.listVMs += item.instanceName + '\n';
          });
        }

        //Thoi gian su dung
        const createDate = new Date(this.volumeInfo?.creationDate);
        const exdDate = new Date(this.volumeInfo?.expirationDate);
        this.expiryTime = (exdDate.getFullYear() - createDate.getFullYear()) * 12 + (exdDate.getMonth() - createDate.getMonth());

      } else {
        this.volumeInfo = null;
      }
    });
  }

  convertString(str: string): string {
    const parts = str.trim().split('\n');
    if (parts.length === 1) {
      return str;
    }
    return parts.join(', ');
  }

  volumeEdit: EditSizeMemoryVolumeDTO = new EditSizeMemoryVolumeDTO();

  volumeInit() {
    this.volumeEdit.serviceInstanceId = this.volumeInfo?.id;
    this.volumeEdit.regionId = this.region;
    this.volumeEdit.newSize = this.validateForm.controls.storage.value + this.volumeInfo?.sizeInGB;
    this.volumeEdit.iops = this.volumeInfo?.iops;
    // editVolumeDto.newOfferId = 0;
    this.volumeEdit.serviceName = this.volumeInfo?.name;
    this.volumeEdit.projectId = this.project;
    this.volumeEdit.customerId = this.tokenService.get()?.userId;
    this.volumeEdit.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    this.volumeEdit.actorEmail = user.email;
    this.volumeEdit.userEmail = user.email;
    this.volumeEdit.serviceType = 2;
    this.volumeEdit.actionType = 4; //resize
  }

  doEditSizeVolume() {
    this.isLoadingConfirm = true;
    this.volumeInit();
    let request = new EditSizeVolumeModel();
    request.customerId = this.volumeEdit.customerId;
    request.createdByUserId = this.volumeEdit.customerId;
    request.note = 'update volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.volumeEdit),
        specificationType: 'volume_resize',
        price: 0,
        serviceDuration: 1
      }
    ];
    console.log('request', request)
    this.volumeService.editSizeVolume(request).subscribe(data => {
        if (data.code == 200) {
          this.isLoadingConfirm = false;
          this.router.navigate(['/app-smart-cloud/volumes']);
          this.notification.success(this.i18n.fanyi('app.status.success'), 'Yêu cầu điều chỉnh dung lượng thành công.');
          console.log(data);
        } else if (data.code == 310) {
          this.isLoadingConfirm = false;
          // this.router.navigate([data.data]);
          window.location.href = data.data;
        } else {
          this.isLoadingConfirm = false;
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.resize.fail'));
        }
      }, error => {
        this.isLoadingConfirm = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
      }
    );
  }

  showConfirmResize() {
    this.isVisibleConfirm = true;
  }

  handleCancelResize() {
    this.isVisibleConfirm = false;
  }

  handleOkResize() {
    this.submitForm();
  }

  ngOnInit() {
    this.volumeId = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    if (this.volumeId != undefined || this.volumeId != null) {
      console.log('id', this.volumeId);
      this.getVolumeById(this.volumeId);
      this.isLoading = true;
      this.projectService.getByProjectId(this.project).subscribe(data => {
        this.isLoading = false;
        this.sizeInCloudProject = data;
        console.log(this.volumeInfo?.volumeType)
        if(this.volumeInfo?.volumeType === 'hdd') {
          this.remaining = this.sizeInCloudProject?.cloudProject?.quotaHddInGb - this.sizeInCloudProject?.cloudProjectResourceUsed?.hdd;
        }
        if(this.volumeInfo?.volumeType === 'ssd') {
          this.remaining = this.sizeInCloudProject?.cloudProject?.quotaSSDInGb - this.sizeInCloudProject?.cloudProjectResourceUsed?.ssd;
        }
      }, error => {
        this.notification.error(error.statusText, 'Lấy dữ liệu thất bại');
        this.isLoading = false;
      });
    }
  }
}
