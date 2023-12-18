import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import Flavor from "../../../../shared/models/flavor.model";
import Image from "../../../../shared/models/image";
import {BackupPackage, SecurityGroupBackup} from "../../../../shared/models/backup-vm";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Router} from "@angular/router";
import {BackupVmService} from "../../../../shared/services/backup-vm.service";

@Component({
  selector: 'one-portal-schedule-backup-volume',
  templateUrl: './schedule-backup-volume.component.html',
  styleUrls: ['./schedule-backup-volume.component.less'],
})
export class ScheduleBackupVolumeComponent implements OnInit{
  @Input() region: number
  @Input() project: number

  isLoading: boolean = false
  validateForm: FormGroup<{
    name: FormControl<string>
    no: FormControl<string>
    backupPackage: FormControl<unknown[]>,
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{1,255}$/)]],
    no: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
    backupPackage: [[] as unknown[], [Validators.required]],
  })

  backupPackages: BackupPackage[] = []

  constructor(private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private router: Router,
              private backupVmService: BackupVmService,) {
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
  }

  submitForm() {
  }

  getBackupPackage() {
    this.backupVmService.getBackupPackages(this.tokenService.get()?.userId).subscribe(data => {
      this.backupPackages = data
      console.log('backup package', this.backupPackages)
    })
  }

  ngOnInit(): void {
  }
}
