import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';


@Component({
  selector: 'one-portal-edit-ipsec-policies',
  templateUrl: './edit-ipsec-policies.component.html',
  styleUrls: ['./edit-ipsec-policies.component.less'],
})
export class EditIpsecPoliciesComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  authorizationAlgorithm = [
    { label: 'sha1', value: '1' },
    { label: 'sha256', value: '2' },
    { label: 'sha384', value: '3' },
    { label: 'sha512', value: '4' },
  ];

  encryptionMode = [
    { label: 'tunnel', value: '1' },
    { label: 'transport', value: '2' },
  ];

  encryptionAlgorithm = [
    { label: 'aes-128', value: '1' },
    { label: '3des', value: '2' },
    { label: 'aes-192', value: '3' },
    { label: 'aes-256', value: '4' },
  ];

  lifetimeUnits = [
    { label: 'seconds', value: '1' },
  ];

  perfectForwardSecrecy = [
    { label: 'group5', value: '1' },
    { label: 'group2', value: '2' },
    { label: 'group14 ', value: '3' },
  ];

  transformProtocol = [
    { label: 'esp', value: '1' },
    { label: 'ah', value: '2' },
    { label: 'ah-esp ', value: '3' },
  ];

  selectedAuthorizationAlgorithm = '1'
  selectedEncryptionMode = '1'
  selectedEncryptionAlgorithm = '1'
  selectedPerfectForwardSecrecy = '1'
  selectedTransformProtocol = '1'
  selectedLifetimeUnits = '1'
  lifetimeValue = 3600
  formCreateFileSystemSnapshot: FormCreateFileSystemSnapShot =
    new FormCreateFileSystemSnapShot();
    selectedFileSystemName: string;
  form: FormGroup<{
    nameFileSystem: FormControl<number>;
    nameSnapshot: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameFileSystem: [null as number, [Validators.required]],
    nameSnapshot: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
    description: [''],
  });



  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }


  constructor(
    private router: Router,
    private fb: NonNullableFormBuilder,
  ) {}

  handleCreate() {
    console.log('success');
    
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }
}
