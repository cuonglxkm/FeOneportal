import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';

export class CloudBackupDTO{
  name:string;
  package:string;
  begin:Date;
  end:Date;
  status:string;
}

@Component({
  selector: 'app-cloud-backup',
  templateUrl: './cloud-backup.component.html',
})

export class CloudBackupComponent implements OnInit {
  isBegin = true;
  isLoaded = false;
  constructor(
    private cloudBackupService: CloudBackupService,
    private router: Router) {
    
  }
  ngOnInit() {
    this.cloudBackupService.hasCloudBackup().subscribe({next:(data)=>{
      if(data){
        this.isBegin = false;
      }
      this.isLoaded = true;
    },error:(err)=>{
      this.isBegin = false;
      this.isLoaded = true;
    }})
  }
  navigateToCreateCloudBackup() {
    this.router.navigate(['/app-smart-cloud/cloud-backup/create']);
  }
}
