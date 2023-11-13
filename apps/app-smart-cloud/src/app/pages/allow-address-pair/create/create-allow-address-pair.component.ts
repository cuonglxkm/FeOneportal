import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AllowAddressPairService} from "../../../core/service/allow-address-pair.service";
import {SecurityGroupSearchCondition} from "../../../core/model/interface/security-group";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import PairInfo, {AllowAddressPairCreateOrDeleteForm} from "../../../core/model/allow-address-pair";
import {RegionModel} from "../../../shared/models/region.model";
import {NzMessageService} from "ng-zorro-antd/message";

// @ts-ignore
@Component({
  selector: 'one-portal-create-allow-address-pair',
  templateUrl: './create-allow-address-pair.component.html',
  styleUrls: ['./create-allow-address-pair.component.less'],
})
export class CreateAllowAddressPairComponent implements OnInit {
  @Input() isVisible: boolean
  @Output() onCancel = new EventEmitter<void>()
  @Output() onOk = new EventEmitter<void>()

  isVisibleCreate = false;
  isCreateLoading = false;

  validateForm: FormGroup<{
    ipAddress: FormControl<string | null>;
  }>;

  value?: string;

  formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm;

  region: RegionModel;

  listPairInfos: PairInfo[];

  constructor(private allowAddressPairService: AllowAddressPairService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private message: NzMessageService) {
  }

  ngOnInit(): void {
    this.conditionSearch.userId = this.tokenService.get()?.userId
    this.conditionSearch.projectId = 4079
    }

  handleCancel(): void {
    this.isVisibleCreate = false;
    this.onCancel.emit();
  }
  handleCreate(){
    this.isCreateLoading = true;
    this.submitForm();
    this.onOk.emit();
  }

  showModalCreate() {
    this.isVisible = true;
  }

  conditionSearch: SecurityGroupSearchCondition;


  submitForm(): void {

    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
      this.create(this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  create(pairInfo: PairInfo) {
    console.log('pair: ', pairInfo);
    this.listPairInfos.push(pairInfo);

    this.formDeleteOrCreate.portId = "08e91567-db66-4034-be81-608dceeb9a5f";
    this.formDeleteOrCreate.pairInfos = this.listPairInfos;
    this.formDeleteOrCreate.isDelete = false;
    this.formDeleteOrCreate.region = this.region.regionId;
    this.formDeleteOrCreate.vpcId = 4079;

    this.allowAddressPairService.createOrDelete(this.formDeleteOrCreate)
        .subscribe(data => {
          this.message.create('Thành công', `Đã tạo thành công`);
        })
  }

  regionChanged(region: RegionModel) {
    this.region = region;
  }


}
