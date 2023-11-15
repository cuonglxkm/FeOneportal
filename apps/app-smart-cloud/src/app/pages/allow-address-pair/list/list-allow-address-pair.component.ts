import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import PairInfo, {
    AllowAddressPairCreateOrDeleteForm,
    AllowAddressPairSearchForm
} from 'src/app/shared/models/allow-address-pair';
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AllowAddressPairService} from "../../../shared/services/allow-address-pair.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute} from "@angular/router";


@Component({
    selector: 'list-allow-address-pair',
    templateUrl: './list-allow-address-pair.component.html',
    styleUrls: ['./list-allow-address-pair.component.less'],
})
export class ListAllowAddressPairComponent implements OnInit {
    @Input() portId: string

    constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private allowAddressPairService: AllowAddressPairService,
                private message: NzMessageService,
                private route: ActivatedRoute) {
    }

    isVisibleCreate = false;


    listPairInfo: PairInfo[] = []

    region: RegionModel;

    validateForm: FormGroup<{
        ipAddress: FormControl<string | null>;
    }>;

    value?: string;

    formSearch: AllowAddressPairSearchForm = new AllowAddressPairSearchForm();

    isVisibleDelete = false;
    isConfirmLoading = false;

    formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm = new AllowAddressPairCreateOrDeleteForm();

    pairInfos: PairInfo[];

    inputValue: string;

    isLoading: boolean = true;

    showModalDelete(): void {
        this.isVisibleDelete = true;
    }

    handleCancelDelete(): void {
        this.isVisibleDelete = false;
    }

    handleOkDelete(pairInfo: PairInfo): void {
        this.isVisibleDelete = false;
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

        console.log('delete', this.formDeleteOrCreate)
        this.getAllowAddressPair(this.formSearch)
    }

    showModalCreate() {
        this.isVisibleCreate = true;
    }

    closeModalCreate() {
        this.isVisibleCreate = false;
    }

    handleCreate(value) {
        this.formDeleteOrCreate.portId = "08e91567-db66-4034-be81-608dceeb9a5f";
        this.formDeleteOrCreate.pairInfos = [value];
        this.formDeleteOrCreate.isDelete = false;
        this.formDeleteOrCreate.region = this.region.regionId;
        this.formDeleteOrCreate.vpcId = 4079;

        this.allowAddressPairService.createOrDelete(this.formDeleteOrCreate)
            .subscribe(data => {
                this.message.create('Thành công', `Đã tạo thành công`);
                this.isVisibleCreate = false;
            })
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
                this.isLoading = false;
            });
    }

    ngOnInit(): void {
        this.formSearch.vpcId = 4079
        this.formSearch.customerId = this.tokenService.get()?.userId
        this.route.queryParams.subscribe(queryParams => {
            const value = queryParams['param'];
            console.log('Received value:', value);
            this.portId = value;
        });

    }

    search() {
        this.formSearch = this.getParam();
        this.getAllowAddressPair(this.formSearch);
    }

    onInputChange(value: string) {
        this.inputValue = value;
    }
}
