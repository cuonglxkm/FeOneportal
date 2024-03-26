import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { RegionModel } from 'src/app/shared/models/region.model';
import { FormCreateEndpointGroup } from 'src/app/shared/models/ipsec-policy';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';


@Component({
    selector: 'one-portal-create-endpoint-group',
    templateUrl: './create-endpoint-group.component.html',
    styleUrls: ['./create-endpoint-group.component.less'],
})
export class CreateEndpointGroupComponent implements OnInit {
    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));

    type = [
        { label: 'Subnet(for local system)', value: 'subnet' },
        { label: 'Cidr(for external system)', value: 'cidr' },
    ];

    selectedType = 'subnet'
    isLoading: boolean = false
    formCreateEndpointGroup: FormCreateEndpointGroup = new FormCreateEndpointGroup();
    form: FormGroup<{
        name: FormControl<string>;
        type: FormControl<string>;
    }> = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
        type: ['', Validators.required]
    });


    getData(): any {
        this.formCreateEndpointGroup.customerId =
            this.tokenService.get()?.userId;
        this.formCreateEndpointGroup.regionId = this.region;
        this.formCreateEndpointGroup.vpcId = this.project;
        this.formCreateEndpointGroup.name =
            this.form.controls.name.value;
        this.formCreateEndpointGroup.description = "";
        this.formCreateEndpointGroup.type = this.form.controls.type.value
        return this.formCreateEndpointGroup;
    }


    ngOnInit(): void {
        let regionAndProject = getCurrentRegionAndProject()
        this.region = regionAndProject.regionId
        this.project = regionAndProject.projectId
    }


    constructor(
        private router: Router,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
        private fb: NonNullableFormBuilder,
        private notification: NzNotificationService,
        private endpointGroupService: EndpointGroupService 
    ) { }

    handleCreate() {
        this.isLoading = true;
        if (this.form.valid) {
            this.formCreateEndpointGroup = this.getData();
            console.log(this.formCreateEndpointGroup);
            this.endpointGroupService
                .create(this.formCreateEndpointGroup)
                .subscribe(
                    (data) => {
                        this.isLoading = false
                        this.notification.success(
                            'Thành công',
                            'Tạo mới endpoint group thành công'
                        );
                        this.router.navigate(['/app-smart-cloud/vpn-site-to-site/manage']);
                    },
                    (error) => {
                        this.isLoading = false
                        this.notification.error(
                            'Thất bại',
                            'Tạo mới endpoint group thất bại'
                        );
                        console.log(error);
                    }
                );
        }

    }

    onRegionChange(region: RegionModel) {
        this.region = region.regionId;
    }

    onProjectChange(project: ProjectModel) {
        this.project = project?.id;
    }
}
