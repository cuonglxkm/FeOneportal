import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FileSystemModel, FormSearchFileSystem } from 'src/app/shared/models/file-system.model';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { FileSystemService } from 'src/app/shared/services/file-system.service';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';


@Component({
  selector: 'one-portal-create-file-system-snapshot',
  templateUrl: './create-file-system-snapshot.component.html',
  styleUrls: ['./create-file-system-snapshot.component.less'],
})
export class CreateFileSystemSnapshotComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;
  pageSize: number = 10;
  pageIndex: number = 1;
  response: BaseResponse<FileSystemModel[]>;
  isLoading: boolean = false;
  isCheckBegin: boolean = false;
  customerId: number;
  selectedFileSystemName: string;

  formCreateFileSystemSnapshot: FormCreateFileSystemSnapShot = new FormCreateFileSystemSnapShot();

  form: FormGroup<{
    nameFileSystem: FormControl<number>;
    nameSnapshot: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameFileSystem: [null as number, [Validators.required]],
    nameSnapshot: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
    description: [''],
  });


  updateSelectedFileSystems(selectedFileSystem: number): void {
      const selectedOption = this.response.records.find(
        (option) => option.id === selectedFileSystem
      );
      if (selectedOption) {
        this.selectedFileSystemName = selectedOption.name;
      }
  }

  getListFileSystem() {
    this.isLoading = true;
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = this.value;
    formSearch.isCheckState = false;
    formSearch.pageSize = this.pageSize;
    formSearch.currentPage = this.pageIndex;
    
    this.fileSystemService.search(formSearch)

      .subscribe(data => {
        this.isLoading = false;
        console.log('data file system', data);
        this.response = data;

      }, error => {
        this.isLoading = false;
        this.response = null;
      });
  }  

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.getListFileSystem()
  }


  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: NonNullableFormBuilder,
     private fileSystemService: FileSystemService,
     private fileSystemSnapshotService: FileSystemSnapshotService,
    private notification: NzNotificationService
  ) {}


  getData(): any {
    this.formCreateFileSystemSnapshot.customerId =
      this.tokenService.get()?.userId;
    this.formCreateFileSystemSnapshot.region = this.region;
    this.formCreateFileSystemSnapshot.projectId = this.project.toString();
    this.formCreateFileSystemSnapshot.name =
      this.form.controls.nameSnapshot.value;
    this.formCreateFileSystemSnapshot.description = this.form.controls.description.value;
    this.formCreateFileSystemSnapshot.shareId = this.form.controls.nameFileSystem.value
    this.formCreateFileSystemSnapshot.displayDescription = this.form.controls.description.value;
    this.formCreateFileSystemSnapshot.displayName = this.form.controls.nameSnapshot.value;
    this.formCreateFileSystemSnapshot.force = true
    this.formCreateFileSystemSnapshot.size = 1
    this.formCreateFileSystemSnapshot.vpcId = this.project
    this.formCreateFileSystemSnapshot.scheduleId = 0
    return this.formCreateFileSystemSnapshot;
  }
  
  handleCreate() {
    this.isLoading = true;
    if (this.form.valid) {
      this.formCreateFileSystemSnapshot = this.getData();
      console.log(this.formCreateFileSystemSnapshot);
      this.fileSystemSnapshotService
        .create(this.formCreateFileSystemSnapshot)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              'Thành công',
              'Tạo mới file system snapshot thành công'
            );
            this.router.navigate(['/app-smart-cloud/file-system-snapshot/list']);
          },
          (error) => {
            this.isLoading = false
            this.notification.error(
              'Thất bại',
              'Tạo mới file system snapshot thất bại'
            );
            console.log(error);
          }
        );
    }
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }
}
