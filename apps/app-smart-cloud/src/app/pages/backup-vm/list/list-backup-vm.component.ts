import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {BackupVm, BackupVMFormSearch} from "../../../shared/models/backup-vm";
import {BackupVmService} from "../../../shared/services/backup-vm.service";
import Pagination from "../../../shared/models/pagination";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
    selector: 'one-portal-list-backup-vm',
    templateUrl: './list-backup-vm.component.html',
    styleUrls: ['./list-backup-vm.component.less'],
})
export class ListBackupVmComponent implements OnInit {

    region = JSON.parse(localStorage.getItem('region')).regionId;

    project = JSON.parse(localStorage.getItem('projectId'));

    value?: string;

    isVisibleDelete: boolean = false

    isLoading: boolean = false;

    status = [
        {label: 'Tất cả', value: 'all'},
        {label: 'Hoạt động', value: 'AVAILABLE'},
        {label: 'Tạm dừng', value: 'SUSPENDED'}
    ]

    serviceStatusMapping = {
        KHOITAO: '-'
    }

    selectedValue?: string = null

    formSearch: BackupVMFormSearch = new BackupVMFormSearch()

    collection: Pagination<BackupVm> = {
        previousPage: 0,
        totalCount: 0,
        records: [],
        currentPage: 1,
        pageSize: 10
    };

    pageSize: number = 10
    pageIndex: number = 1

    userId: number

    id: number

    selectedOptionAction: string
    selectedAction: BackupVm

    constructor(private backupVmService: BackupVmService,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private router: Router,
                private notification: NzNotificationService) {
    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId
        this.formSearch.regionId = this.region
        this.getListBackupVM()
    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
        this.formSearch.projectId = this.project
        this.getListBackupVM()
    }

    onInputChange(value: string) {
        this.value = value;
        console.log('input text: ', this.value)
    }

    showModalDelete(id: number): void {
        this.isVisibleDelete = true;
        this.id = id
    }

    handleCancelDelete(): void {
        this.isVisibleDelete = false;
    }

    handleOkDelete() {
        this.isLoading = true
        this.isVisibleDelete = false
        this.backupVmService.delete(this.id).subscribe(data => {
            this.isLoading = false
            this.notification.success('Thành công', 'Xóa thành công')
            this.getListBackupVM()
        }, error => {
            this.isLoading = false
            this.notification.error('Thất bại', 'Xóa thất bại')
            this.getListBackupVM()
        })
    }

    getListBackupVM() {
        this.formSearch = this.getParam();
        this.isLoading = true;
        this.backupVmService.search(this.formSearch).subscribe(data => {
            this.isLoading = false
            this.collection = data
            console.log(this.collection)
        })
    }

    onChange(value: string) {
        this.selectedValue = value;
        if (this.selectedValue === 'all') {
            this.formSearch.status = null
        } else {
            this.formSearch.status = value
        }
        this.formSearch.currentPage = 1
        console.log('form search', this.formSearch)
        this.getListBackupVM()
    }

    onQueryParamsChange(params: NzTableQueryParams) {
        const {pageSize, pageIndex} = params
        this.formSearch.pageSize = pageSize;
        this.formSearch.currentPage = pageIndex
        this.getListBackupVM();
    }

    ngOnInit(): void {
        this.userId = this.tokenService.get()?.userId
        this.formSearch.currentPage = 1
        this.formSearch.pageSize = 10
    }

    getParam(): BackupVMFormSearch {
        this.formSearch.regionId = this.region

        this.formSearch.customerId = this.tokenService.get()?.userId
        this.formSearch.projectId = this.project

        if (this.value === undefined) {
            this.formSearch.instanceBackupName = null
        } else {
            this.formSearch.instanceBackupName = this.value
        }

        return this.formSearch
    }

    navigateToDetail(id: number) {
        this.router.navigate(['/app-smart-cloud/backup-vm/detail-backup-vm/' + id])
    }

    navigateToRestore(id: number) {
        this.router.navigate(['/app-smart-cloud/backup-vm/restore-backup-vm/' + id])
    }

    selectedActionChange(value: any, data: BackupVm) {
        this.selectedOptionAction = value
        this.selectedAction = data
        switch (parseInt(value, 10)) {
            case 1:
                this.navigateToRestore(data.id)
                break;
            case 2:
                this.showModalDelete(data.id)
                break;
            default:
                break;
        }
    }
}
