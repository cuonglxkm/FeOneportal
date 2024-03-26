import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';


@Component({
    selector: 'one-portal-create-endpoint-group',
    templateUrl: './create-endpoint-group.component.html',
    styleUrls: ['./create-endpoint-group.component.less'],
})
export class CreateEndpointGroupComponent implements OnInit {
    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));

    type = [
        { label: 'subnet', value: '1' },
        { label: 'cidr', value: '2' },
    ];

    selectedType = '1'
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
    ) { }

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
