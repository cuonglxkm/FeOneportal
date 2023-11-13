import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import PairInfo, {
    AllowAddressPairCreateOrDeleteForm,
    AllowAddressPairSearchForm
} from 'src/app/core/model/allow-address-pair';
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AllowAddressPairService} from "../../../core/service/allow-address-pair.service";
import {NzMessageService} from "ng-zorro-antd/message";


@Component({
    selector: 'one-portal-list-security-group-allow-address-pair',
    templateUrl: './list-allow-address-pair.component.html',
    styleUrls: ['./list-allow-address-pair.component.less'],
})
export class ListAllowAddressPairComponent implements OnInit {
    @Input() portId: string

    constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private allowAddressPairService: AllowAddressPairService,
                private message: NzMessageService) {
    }

    isVisibleCreate = false;


    listPairInfo: PairInfo[] = []

    region: RegionModel;

    validateForm: FormGroup<{
        ipAddress: FormControl<string | null>;
    }>;

    value?: string;

    formSearch: AllowAddressPairSearchForm = new AllowAddressPairSearchForm();

    isVisible = false;
    isConfirmLoading = false;

    formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm = new AllowAddressPairCreateOrDeleteForm();

    pairInfos: PairInfo[];

    inputValue: string;

    showModal(): void {
        this.isVisible = true;
    }

    handleOk(pairInfo: PairInfo): void {
        if (this.pairInfos) {
            this.pairInfos.push(pairInfo);
        } else {
            this.pairInfos = [pairInfo];
        }

        this.isConfirmLoading = true;
        this.formDeleteOrCreate.portId = "08e91567-db66-4034-be81-608dceeb9a5f";
        this.formDeleteOrCreate.pairInfos = this.pairInfos;

        this.formDeleteOrCreate.isDelete = true;
        this.formDeleteOrCreate.region = this.region.regionId;
        this.formDeleteOrCreate.vpcId = 4079;
        this.formDeleteOrCreate.customerId = this.tokenService.get()?.userId;
        this.allowAddressPairService.createOrDelete(this.formDeleteOrCreate)
            .subscribe(data => {
                this.message.create('Thành công', `Đã xóa thành công`);
            })
    }

    handleCancel(): void {
        this.isVisible = false;
    }

    handleOkCreate() {

    }

    handleCancelCreate() {
        this.isVisibleCreate = false;
    }

    showModalCreate() {
        this.isVisibleCreate = true;
    }

    regionChanged(region: RegionModel) {
        this.region = region;
        this.formSearch = this.getParam();
        this.getAllowAddressPair(this.formSearch);
    }

    getParam(): AllowAddressPairSearchForm {
        this.formSearch.region = this.region.regionId;
        this.formSearch.portId = "08e91567-db66-4034-be81-608dceeb9a5f";
        this.formSearch.pageSize = 10;
        this.formSearch.currentPage = 1;
        if (this.value === undefined) {
            this.formSearch.search = null;
        } else {
            this.formSearch.search = this.value;
        }
        return this.formSearch;
    }

    getAllowAddressPair(formSearch: AllowAddressPairSearchForm) {
        this.allowAddressPairService.search(formSearch)
            .subscribe((data: any) => {
                this.listPairInfo = data.records;
            });
    }

    ngOnInit(): void {
        this.formSearch.vpcId = 4079
        this.formSearch.customerId = this.tokenService.get()?.userId
    }

    search() {
        this.formSearch = this.getParam();
        this.getAllowAddressPair(this.formSearch);
    }

    onInputChange(value: string) {
        this.inputValue = value;
    }
}
