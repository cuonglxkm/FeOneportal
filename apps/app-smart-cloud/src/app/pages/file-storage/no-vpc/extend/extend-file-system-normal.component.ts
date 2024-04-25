import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSystemService } from '../../../../shared/services/file-system.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesService } from '../../../instances/instances.service';
import { FileSystemDetail } from '../../../../shared/models/file-system.model';
import { OrderItem } from '../../../../shared/models/price';
import { Subject } from 'rxjs';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel } from '../../../../../../../app-kubernetes/src/app/shared/models/region.model';
import { ProjectModel } from '../../../../../../../app-kubernetes/src/app/shared/models/project.model';
import { ProjectService } from '../../../../../../../app-kubernetes/src/app/shared/services/project.service';

@Component({
  selector: 'one-portal-extend-file-system-normal',
  templateUrl: './extend-file-system-normal.component.html',
  styleUrls: ['./extend-file-system-normal.component.less']
})
export class ExtendFileSystemNormalComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idFileSystem: number;

  storage: number;
  isLoading: boolean = false;
  fileSystem: FileSystemDetail = new FileSystemDetail();

  isInitSnapshot: boolean = false;

  snapshot: any;

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;
  dataSubjectTime: Subject<any> = new Subject<any>();

  validateForm: FormGroup<{
    snapshot: FormControl<boolean>
    time: FormControl<number>
  }> = this.fb.group({
    snapshot: [false],
    time: [1, [Validators.required]]
  });

  estimateExpireDate: Date = null;

  constructor(private fb: NonNullableFormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fileSystemService: FileSystemService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private projectService: ProjectService,
              private instanceService: InstancesService) {
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
      if (this.fileSystem?.shareSnapshotId == null) {
        this.isInitSnapshot = false;
      } else {
        this.isInitSnapshot = true;
      }
      this.validateForm.controls.snapshot.setValue(this.isInitSnapshot);
      const oldDate = null;
      // new Date(this.fileSystem?.expirationDate);
      this.estimateExpireDate = oldDate;
      const exp = this.estimateExpireDate.setDate(oldDate.getDate() + 30);
      this.estimateExpireDate = new Date(exp);
    }, error => {
      this.fileSystem = null;
      this.isLoading = false;
    });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.idFileSystem = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idFileSystem'));
    this.getFileSystemById(this.idFileSystem);
  }
}
