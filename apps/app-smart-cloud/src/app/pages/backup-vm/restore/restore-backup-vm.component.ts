import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder} from "@angular/forms";
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from "@angular/router";
import {getCurrentRegionAndProject} from "@shared";
import { ProjectService, RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

@Component({
    selector: 'one-portal-restore-backup-vm',
    templateUrl: './restore-backup-vm.component.html',
    styleUrls: ['./restore-backup-vm.component.less'],
})
export class RestoreBackupVmComponent implements OnInit {

    region = JSON.parse(localStorage.getItem('regionId'));
    project = JSON.parse(localStorage.getItem('projectId'));

    selectedValueRadio = 'O';

    validateForm: FormGroup<{
        radio: FormControl<any>
    }> = this.fb.group({
        radio: [''],
    })

    backupVmId: number

    constructor(private fb: NonNullableFormBuilder,
                private location: Location,
                private route: ActivatedRoute,
                private router: Router,
                private projectService: ProjectService) {
    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId
      this.projectService.getByRegion(this.region).subscribe(data => {
        if (data.length) {
          localStorage.setItem("projectId", data[0].id.toString())
          this.router.navigate(['/app-smart-cloud/backup-vm'])
        }
      });

    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
    }

    goBack() {
        this.location.back();
    }

    ngOnInit() {
        console.log(this.region)
        console.log(this.project)
      let regionAndProject = getCurrentRegionAndProject()
      this.region = regionAndProject.regionId
      this.project = regionAndProject.projectId
        const backupVmId = this.route.snapshot.paramMap.get('id')
        this.backupVmId = parseInt(backupVmId)
    }


    onChangeStatus() {
        console.log('Selected option changed:', this.selectedValueRadio);
    }
}
