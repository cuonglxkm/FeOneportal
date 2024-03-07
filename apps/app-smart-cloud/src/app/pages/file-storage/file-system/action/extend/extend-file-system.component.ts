import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../../../shared/models/region.model';
import { ProjectModel } from '../../../../../shared/models/project.model';
import { FormControl, FormGroup, Validators, NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'one-portal-extend-file-system',
  templateUrl: './extend-file-system.component.html',
  styleUrls: ['./extend-file-system.component.less'],
})
export class ExtendFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idWan: number
  wanName: string

  validateForm: FormGroup<{
    storage: FormControl<number>
  }> = this.fb.group({
    storage: [1, [Validators.required]]
  });

  constructor(private fb: NonNullableFormBuilder) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  ngOnInit() {
  }
}
