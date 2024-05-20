import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  BaseResponse,
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import {
  FileSystemModel,
  FormSearchFileSystem,
} from '../../../shared/models/file-system.model';
import { FileSystemService } from '../../../shared/services/file-system.service';
import { getCurrentRegionAndProject } from '@shared';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { error } from 'console';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { ProjectService } from 'src/app/shared/services/project.service';
@Component({
  selector: 'one-portal-list-file-system',
  templateUrl: './list-file-system.component.html',
  styleUrls: ['./list-file-system.component.less'],
})
export class ListFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<FileSystemModel[]>;

  isLoading: boolean = false;

  isCheckBegin: boolean = false;

  customerId: number;

  typeVpc: number;

  projectInfo: SizeInCloudProject = new SizeInCloudProject();

  constructor(
    private router: Router,
    private fileSystemService: FileSystemService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private projectService: ProjectService
  ) {}

  onInputChange(value) {
    this.value = value;
    this.getListFileSystem(false);
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type;
    this.getListFileSystem(true);
    this.getProject();
  }

  navigateToExtendFileSystem(id) {
    this.router.navigate(['/app-smart-cloud/file-storage/' + id + '/extend']);
  }

  navigateToCreateFileSystem(typeVpc) {
    this.fileSystemService.checkRouter(this.region, this.project).subscribe({
      next: (data) => {
        //in vpc
        if (typeVpc == 1) {
          this.router.navigate([
            '/app-smart-cloud/file-storage/file-system/create',
          ]);
        }

        //no vpc
        if (typeVpc == 0) {
          this.router.navigate([
            '/app-smart-cloud/file-storage/file-system/create/normal',
          ]);
        }
      },
      error: (error) => {
        if (error.error.detail.includes('Vui lòng kiểm tra Router')) {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.checkRouter.file.system')
          );
        } else if (
          error.error.detail.includes('Kiểm tra lại Router Interface')
        ) {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.checkRouter.file.system.noGateway')
          );
        }
      },
    });
  }

  navigateToResizeFileSystem(typeVpc, id) {
    //in vpc
    if (typeVpc == 1) {
      this.router.navigate([
        '/app-smart-cloud/file-storage/file-system/resize/' + id,
      ]);
    }

    //no vpc
    if (typeVpc == 0) {
      this.router.navigate([
        '/app-smart-cloud/file-storage/file-system/' + id + '/resize',
      ]);
    }
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListFileSystem(false);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListFileSystem(false);
  }

  getListFileSystem(isBegin) {
    this.isLoading = true;
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = this.value;
    formSearch.isCheckState = true;
    formSearch.pageSize = this.pageSize;
    formSearch.currentPage = this.pageIndex;

    this.fileSystemService
      .search(formSearch)

      .subscribe(
        (data) => {
          this.isLoading = false;
          console.log('data file system', data);
          this.response = data;

          if (isBegin) {
            this.isCheckBegin =
              this.response.records.length < 1 || this.response.records === null
                ? true
                : false;
          }
        },
        (error) => {
          this.isLoading = false;
          this.response = null;
        }
      );
  }

  handleOkEdit() {
    this.getListFileSystem(false);
  }

  handleOkDelete() {
    this.getListFileSystem(false);
  }

  getProject() {
    this.projectService.getByProjectId(this.project).subscribe((data) => {
      this.projectInfo = data;
    });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getProject();

    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;
    this.fileSystemService.model.subscribe((data) => {
      console.log(data);
    });
  }
}
