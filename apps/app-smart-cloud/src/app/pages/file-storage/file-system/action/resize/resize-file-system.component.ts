import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSystemService } from '../../../../../shared/services/file-system.service';
import {
  FileSystemDetail,
  ResizeFileSystem,
  ResizeFileSystemRequestModel
} from '../../../../../shared/models/file-system.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'one-portal-resize-file-system',
  templateUrl: './resize-file-system.component.html',
  styleUrls: ['./resize-file-system.component.less']
})
export class ResizeFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idFileSystem: number;

  validateForm: FormGroup<{
    storage: FormControl<number>
  }> = this.fb.group({
    storage: [1, [Validators.required]]
  });

  storage: number;
  isLoading: boolean = false;
  fileSystem: FileSystemDetail = new FileSystemDetail();

  resizeFileSystem: ResizeFileSystem = new ResizeFileSystem();

  quotaShareInGb: number;

  constructor(private fb: NonNullableFormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fileSystemService: FileSystemService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService,
              private projectService: ProjectService) {
  }

  regionChanged(region: RegionModel) {
    // this.region = region.regionId
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  getFileSystemById(id) {
    this.isLoading = true;
    this.fileSystemService.getFileSystemById(id, this.region).subscribe(data => {
      this.fileSystem = data;
      this.isLoading = false;
      this.storage = this.fileSystem.size;
      // this.validateForm.controls.storage.setValue(this.fileSystem.size);
    }, error => {
      this.fileSystem = null;
      this.isLoading = false;
    });
  }


  initFileSystem() {
    this.resizeFileSystem.customerId = this.tokenService.get()?.userId;

    this.resizeFileSystem.size = this.validateForm.controls.storage.value + this.fileSystem?.size;
    this.resizeFileSystem.newOfferId = 0;
    this.resizeFileSystem.serviceType = 18;
    this.resizeFileSystem.actionType = 4;
    this.resizeFileSystem.serviceInstanceId = this.idFileSystem;
    this.resizeFileSystem.regionId = this.region;
    this.resizeFileSystem.serviceName = null;
    this.resizeFileSystem.vpcId = this.project;
    this.resizeFileSystem.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.ShareResizeSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
    this.resizeFileSystem.userEmail = this.tokenService.get()?.email;
    this.resizeFileSystem.actorEmail = this.tokenService.get()?.email;
  }

  doResizeFileSystem() {
    this.isLoading = true;
    this.initFileSystem();
    let request = new ResizeFileSystemRequestModel();
    request.customerId = this.resizeFileSystem.customerId;
    request.createdByUserId = this.resizeFileSystem.customerId;
    request.note = 'Điều chỉnh dung lượng File System';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.resizeFileSystem),
        specificationType: 'filestorage_resize',
        serviceDuration: 1
      }
    ];
    console.log('request', request);
    this.fileSystemService.resize(request).subscribe(data => {
      if (data != null) {
        if (data.code == 200) {
          this.isLoading = false;
          this.notification.success(this.i18n.fanyi('app.status.success'), 'Yêu cầu điều chỉnh File Storage thành công.');
          this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
        }
      } else {
        this.isLoading = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), 'Yêu cầu điều chỉnh File Storage thất bại.');
      }
    }, error => {
      this.isLoading = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), 'Yêu cầu điều chỉnh File Storage thất bại.');
    });

  }

  ngOnInit() {
    this.idFileSystem = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.projectService.getByProjectId(this.project).subscribe(data => {
      this.quotaShareInGb = data.cloudProject.quotaShareInGb;
      this.getFileSystemById(this.idFileSystem);
    });

  }
}
