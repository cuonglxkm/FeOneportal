import {Component, Inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {InstanceService} from "../../../../shared/services/instance.service";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import Pagination from "../../../../shared/models/pagination";
import {ExecuteAttachOrDetach} from "../../../../shared/models/security-group";
import {SecurityGroupService} from "../../../../shared/services/security-group.service";
import {Instance} from 'src/app/pages/instances/instances.model';
import {InstanceFormSearch} from "../../../instances/instances.model";

@Component({
    selector: 'one-portal-list-virtual-machine',
    templateUrl: './list-virtual-machine.component.html',
    styleUrls: ['./list-virtual-machine.component.less'],
})
export class ListVirtualMachineComponent implements OnInit, OnChanges {

    @Input() securityGroupId: string;
    @Input() regionId: number
    @Input() projectId: number

    pageSize: number = 10
    pageNumber: number = 1
    collection: Pagination<Instance>
    condition: InstanceFormSearch = new InstanceFormSearch()
    isLoading = false;

    attachOrDetachForm: ExecuteAttachOrDetach = new ExecuteAttachOrDetach()

    isVisibleAttach = false
    isVisibleDetach = false
    instanceId: number


    constructor(
        private instanceService: InstanceService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
        private notification: NzNotificationService,
        private securityGroupService: SecurityGroupService
    ) {
    }



    onQueryParamsChange(params: NzTableQueryParams) {
        const {pageSize, pageIndex} = params
        this.pageSize = pageSize;
        this.pageNumber = pageIndex
        this.getInstances()
    }

    getInstances() {
        this.condition.userId = this.tokenService.get()?.userId

        this.condition.region = this.regionId
        this.condition.pageNumber = this.pageNumber
        this.condition.pageSize = this.pageSize
        this.condition.isCheckState = true
        this.isLoading = true
        this.instanceService.search(this.condition).subscribe(data => {
            this.isLoading = false
            this.collection = data
            console.log('data', this.collection)
        }, error => {
            this.isLoading = false
            this.notification.error('Thất bại', 'Lấy thông tin máy ảo thất bại')
        })
    }

    showModalAttach(instanceId): void {
        this.instanceId = instanceId
        this.isVisibleAttach = true;
    }

    handleOkAttach(): void {
        console.log('id', this.instanceId)
        this.isVisibleAttach = false;
        this.attachOrDetachForm.securityGroupId = this.securityGroupId
        this.attachOrDetachForm.instanceId = this.instanceId
        this.attachOrDetachForm.action = 'attach'
        this.attachOrDetachForm.userId = this.tokenService.get()?.userId
        this.attachOrDetachForm.regionId = this.regionId
        this.attachOrDetachForm.projectId = this.projectId
        this.securityGroupService.attachOrDetach(this.attachOrDetachForm).subscribe(data => {
            this.notification.success('Thành công', 'Gán Security Group vào máy ảo thành công')
            this.getInstances()
        }, error => {
            this.notification.error('Thất bại', 'Gán Security Group vào máy ảo thất bại')
        })
    }

    handleCancelAttach(): void {
        this.isVisibleAttach = false;
    }

    showModalDetach(instanceId: number): void {
        this.instanceId = instanceId
        this.isVisibleDetach = true;
    }

    handleOkDetach(): void {
        this.isVisibleDetach = false;
        this.attachOrDetachForm.securityGroupId = this.securityGroupId
        this.attachOrDetachForm.instanceId = this.instanceId
        this.attachOrDetachForm.action = 'detach'
        this.attachOrDetachForm.userId = this.tokenService.get()?.userId
        this.attachOrDetachForm.regionId = this.regionId
        this.attachOrDetachForm.projectId = this.projectId
        this.securityGroupService.attachOrDetach(this.attachOrDetachForm).subscribe(data => {
            this.notification.success('Thành công', 'Gỡ Security Group vào máy ảo thành công')
            this.getInstances()
        }, error => {
            this.notification.error('Thất bại', 'Gỡ Security Group vào máy ảo thất bại')
        })
    }

    handleCancelDetach(): void {
        this.isVisibleDetach = false;
    }

    ngOnInit(): void {
        this.getInstances()
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.securityGrouup) {
            this.getInstances()
        }
    }
}



