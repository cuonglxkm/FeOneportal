import {Component, Input, OnInit} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ScheduleService} from "../../../../shared/services/schedule.service";

@Component({
  selector: 'one-portal-edit-schedule-backup-vm',
  templateUrl: './edit-schedule-backup-vm.component.html',
  styleUrls: ['./edit-schedule-backup-vm.component.less'],
})
export class EditScheduleBackupVmComponent implements OnInit{

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  modeType: any
  mode = [
    {label: 'Hàng ngày', value: '1'},
    {label: 'Theo thứ', value: '2'},
    {label: 'Theo tuần', value: '3'},
    {label: 'Theo tháng', value: '4'}
  ]
  isLoading: boolean = false

  validateForm: FormGroup<{
    backupMode: FormControl<number>
    name: FormControl<string>
    backupPackage: FormControl<number>
    description: FormControl<string>
    instanceId: FormControl<number>
    months: FormControl<number>
    times: FormControl<string>
    numberOfWeek: FormControl<string>
    // flavor: FormControl<Flavor | null>
    // image: FormControl<Image | null>
    // securityGroup: FormControl<SecurityGroupBackup[]>
    // iops: FormControl<number>
    // storage: FormControl<number>
    // radio: FormControl<any>
    // volumeToBackupIds: FormControl<number[] | null>
  }> = this.fb.group({
    backupMode: [0, [Validators.required]],
    name: ['', [Validators.required]],
    backupPackage: [0, [Validators.required]],
    description: ['', [Validators.maxLength(700)]],
    instanceId: [null as number, [Validators.required]],
    months: [null as number, [Validators.required, Validators.pattern(/^[1-9]$|^1[0-9]$|^2[0-4]$/)]],
    times: ['', [Validators.required]],
    numberOfWeek: [null as string, [Validators.required]]
    // flavor: [null as Flavor | null, [Validators.required]],
    // image: [null as Image | null, [Validators.required]],
    // securityGroup: [[] as SecurityGroupBackup[], [Validators.required]],
    // iops: [null as number | null, [Validators.required]],
    // storage: [null as number | null, [Validators.required]],
    // radio: [''],
    // volumeToBackupIds: [[] as number[]]
  })
  constructor(private fb: NonNullableFormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private scheduleService: ScheduleService) {

  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId

  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  modeChange(value: string) {
    console.log('type', value)
    if (value === '1') {
      this.modeType = '1'
    } else if (value === '2') {
      this.modeType = '2'
    } else if (value === '3') {
      this.modeType = '3'
    } else if (value === '4') {
      this.modeType = '4'
    }
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/schedule/backup/list'])
  }

  submitForm() {

  }

  ngOnInit(): void {
  }
}
