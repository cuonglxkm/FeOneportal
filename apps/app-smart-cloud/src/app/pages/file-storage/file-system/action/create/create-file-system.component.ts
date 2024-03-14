import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../../../shared/models/region.model';
import { ProjectModel } from '../../../../../shared/models/project.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { SnapshotVolumeService } from '../../../../../shared/services/snapshot-volume.service';

@Component({
  selector: 'one-portal-create-file-system',
  templateUrl: './create-file-system.component.html',
  styleUrls: ['./create-file-system.component.less'],
})
export class CreateFileSystemComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    name: FormControl<string>
    protocol: FormControl<number>
    type: FormControl<number>
    storage: FormControl<number>
    checked: FormControl<boolean>
    description: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required]],
    protocol: [1, [Validators.required]],
    type: [1, [Validators.required]],
    storage: [1, [Validators.required]],
    checked: [false],
    description: ['']
  });

  optionProtocols = [
    {value: 1, label: 'NFS'},
    {value: 2, label: 'CIFS'}
  ]

  constructor(private fb: NonNullableFormBuilder,
              private snapshotvlService: SnapshotVolumeService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  getListSnapshot() {
    // this.snapshotvlService.getSnapshotVolumes(userId, this.createVolumeInfo.vpcId, this.createVolumeInfo.regionId,
    //   null, 10000, 1, null, null, null).subscribe(data => {
    //   data.records.forEach(snapshot => {
    //     this.snapshotList.push({label: snapshot.name, value: snapshot.id});
    //   })
    // });
  }
  submitForm() {
    if(this.validateForm.valid){
      console.log('data', this.validateForm.getRawValue())
    }
  }

  ngOnInit() {
  }
}
