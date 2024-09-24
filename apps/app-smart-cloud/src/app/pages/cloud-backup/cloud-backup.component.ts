import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';
import { ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { CloudBackup } from './cloud-backup.model';

@Component({
  selector: 'app-cloud-backup',
  templateUrl: './cloud-backup.component.html',
})

export class CloudBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  isLoading = false;
  typeVPC: number;
  isFirstVisit: boolean = true;
  isBegin = true;
  isLoaded = false;
  cloudBackup: CloudBackup;
  constructor(
    private cloudBackupService: CloudBackupService,
    private router: Router) {
    
  }
  ngOnInit() {
    this.cloudBackupService.findCloudBackupByProject(this.region ,this.project)
    .subscribe({
      next:(data)=>{
        if(data){
          this.isBegin = false;
          this.cloudBackup = data;
        }
        this.isLoaded = true;
      },
      error:(err)=>{
        this.isLoaded = true;
      }
    })
  }

  
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    setTimeout(() => {
      //this.getListVolume(true);
    }, 2500);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.isFirstVisit = false;
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.isLoading = true;
    // this.getListVolume(true);
    // this.isCreateOrder = this.policyService.hasPermission("volumesnapshot:Search") &&
    //   this.policyService.hasPermission("configuration:Get") &&
    //   this.policyService.hasPermission("order:GetOrderAmount") &&
    //   this.policyService.hasPermission("order:Create") &&
    //   this.policyService.hasPermission("instance:List") &&
    //   this.policyService.hasPermission("volume:List") &&
    //   this.policyService.hasPermission("volumesnapshot:Get") &&
    //   this.policyService.hasPermission("volume:Get");
  }
  navigateToCreateCloudBackup() {
    this.router.navigate(['/app-smart-cloud/cloud-backup/create']);
  }

}
