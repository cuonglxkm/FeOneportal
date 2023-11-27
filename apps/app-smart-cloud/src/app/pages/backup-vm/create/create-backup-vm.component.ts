import {Component, OnInit} from '@angular/core';
import {BackupVm} from "../../../shared/models/backup-vm";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {InstancesModel} from "../../instances/instances.model";
import {InstancesService} from "../../instances/instances.service";
import {ActivatedRoute} from "@angular/router";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {AppValidator} from "../../../../../../../libs/common-utils/src";

@Component({
    selector: 'one-portal-create-backup-vm',
    templateUrl: './create-backup-vm.component.html',
    styleUrls: ['./create-backup-vm.component.less'],
})
export class CreateBackupVmComponent implements OnInit {

    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));
    isLoading: boolean = true;

    backupVm: BackupVm;

    instance: InstancesModel;

    validateForm: FormGroup<{
        instanceId: FormControl<number>;
        backupName: FormControl<string>;
        backupInstanceOfferId: FormControl<number>;
        customerId: FormControl<number>;
        volumeToBackupIds: FormControl<number[]>;
        securityGroupToBackupIds: FormControl<number[]>;
        projectId: FormControl<number>;
        description: FormControl<string>;
        scheduleId: FormControl<number>;
        backupPacketId: FormControl<number>;
    }> = this.fb.group({
        instanceId: [0, [Validators.required]],
        backupName: ['', [Validators.required]],
        backupInstanceOfferId: [0, [Validators.required]],
        customerId: [0, [Validators.required]],
        volumeToBackupIds: [[] as number[], [Validators.required]],
        securityGroupToBackupIds: [[] as number[], [Validators.required]],
        projectId: [0, [Validators.required]],
        description: ['', [Validators.required]],
        scheduleId: [0, [Validators.required]],
        backupPacketId: [0, [Validators.required]],
    });

    constructor(
        private backupVmService: BackupVmService,
        private instanceService: InstancesService,
        private route: ActivatedRoute,
        private fb: NonNullableFormBuilder,
    ) {
    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId
    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
    }

    submitForm(): void {
        if (this.validateForm.valid) {
            console.log(this.validateForm.getRawValue());
        } else {
            Object.values(this.validateForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({onlySelf: true});
                }
            });
        }
    }

    ngOnInit(): void {
        const selectedInstanceId = this.route.snapshot.paramMap.get('id')
        if (selectedInstanceId) {
            this.instanceService.getInstanceById(parseInt(selectedInstanceId)).subscribe(data => {
                this.instance = data;
                this.isLoading = false
            })
        }
    }

    protected readonly console = console;
}
