import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { CloudBackup } from '../cloud-backup.model';
import { CloudBackupService } from 'src/app/shared/services/cloud-backup.service';

@Component({
  selector: 'app-cloud-backup-info',
  templateUrl: './cloud-backup-info.component.html',
  styleUrls: ['./cloud-backup-info.component.less']
})

export class CloudBackupInfoComponent implements OnInit {

  data: CloudBackup;
  isVisibleCreateAccessRule:boolean = false;
  isVisibleDeleteCloudBackup:boolean = false;
  constructor(private service: CloudBackupService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService,
              private router: Router,
            ) {
  }

  ngOnInit() {
    this.getData();
  }

  private getData() {
    this.service.getCloudBackup()
      .subscribe({
        next: data => {
          this.data = data;
        },
        error: error =>{
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi(error.error.message));
        }
      });
  }
  extend(){

  }
  resize(){

  }
  openCreateAccessRule(){
    this.isVisibleCreateAccessRule = true;
  }
  closeCreateAccessRule(){
    this.isVisibleCreateAccessRule = false;
  }
  openDeleteCloudBackup(){
    this.isVisibleDeleteCloudBackup = true;
    console.log('isVisibleDeleteCloudBackup',this.isVisibleDeleteCloudBackup);
  }
  closeDeleteCloudBackup(){
    this.isVisibleDeleteCloudBackup = false;
  }
}
