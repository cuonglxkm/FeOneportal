import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../../../shared/models/region.model';
import { ProjectModel } from '../../../../../shared/models/project.model';
import { FormControl, FormGroup, Validators, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileSystemService } from '../../../../../shared/services/file-system.service';
import { FileSystemDetail } from '../../../../../shared/models/file-system.model';

@Component({
  selector: 'one-portal-extend-file-system',
  templateUrl: './extend-file-system.component.html',
  styleUrls: ['./extend-file-system.component.less'],
})
export class ExtendFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idFileSystem: number

  validateForm: FormGroup<{
    storage: FormControl<number>
  }> = this.fb.group({
    storage: [1, [Validators.required]]
  });

  storage: number
  isLoading: boolean = false
  fileSystem: FileSystemDetail = new FileSystemDetail();

  constructor(private fb: NonNullableFormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fileSystemService: FileSystemService) {
  }

  regionChanged(region: RegionModel) {
    // this.region = region.regionId
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }
  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list'])
  }

  getFileSystemById(id) {
    this.isLoading = true
    this.fileSystemService.getFileSystemById(id, this.region).subscribe(data => {
      this.fileSystem = data
      this.isLoading = false
    }, error => {
      this.fileSystem = null
      this.isLoading = false
    })
  }

  initFileSystem() {

  }

  doExtendFileSystem() {

  }
  ngOnInit() {
    this.idFileSystem = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getFileSystemById(this.idFileSystem)
  }
}
