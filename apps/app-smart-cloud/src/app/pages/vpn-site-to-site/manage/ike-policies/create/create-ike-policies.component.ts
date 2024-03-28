import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { IKEPolicyModel} from 'src/app/shared/models/vpns2s.model';


@Component({
  selector: 'one-portal-create-ike-policies',
  templateUrl: './create-ike-policies.component.html',
  styleUrls: ['./create-ike-policies.component.less'],
})
export class CreateIkePoliciesComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  ikePolicyModel: IKEPolicyModel = {
    id: null,
    name: null,
    encryptionAlgorithm: 'aes-128',
    authorizationAlgorithm: 'sha1',
    ikeVersion: 'v1',
    lifetimeUnits: 'seconds',
    lifetimeValue: 3600,
    perfectForwardSecrecy: 'group5',
    phase1NegotiationMode: 'main',
    regionId: 0,
    customerId: 0,
    projectId: 0
  }; ;
  authorizationAlgorithm = [
    { label: 'sha1', value: 'sha1' },
    { label: 'sha256', value: 'sha256' },
    { label: 'sha384', value: 'sha384' },
    { label: 'sha512', value: 'sha512' },
  ];

  ikeVersion = [
    { label: 'v1', value: 'v1' },
    { label: 'v2', value: 'v2' },
  ];

  encryptionAlgorithm = [
    { label: 'aes-128', value: 'aes-128' },
    { label: '3des', value: '3des' },
    { label: 'aes-192', value: 'aes-192' },
    { label: 'aes-256', value: 'aes-256' },
  ];

  lifetimeUnits = [
    { label: 'seconds', value: 'seconds' },
  ];

  perfectForwardSecrecy = [
    { label: 'group5', value: 'group5' },
    { label: 'group2', value: 'group2' },
    { label: 'group14 ', value: 'group14' },
  ];

  phase1Negotiation = [
    { label: 'main', value: 'main' },
    { label: 'aggressive', value: 'aggressive' }
  ];

  selectedAuthorizationAlgorithm = '1'
  selectedIKEVersion = '1'
  selectedEncryptionAlgorithm = '1'
  selectedPerfectForwardSecrecy = '1'
  selectedphase1Negotiation = '1'
  selectedLifetimeUnits = '1'
  lifetimeValue = 3600
  formCreateFileSystemSnapshot: FormCreateFileSystemSnapShot =
    new FormCreateFileSystemSnapShot();
    selectedFileSystemName: string;
  form: FormGroup<{
    nameIke: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameIke: [''],
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
