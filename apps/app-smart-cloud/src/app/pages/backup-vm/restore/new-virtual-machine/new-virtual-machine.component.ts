import {Component, Inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Location} from '@angular/common';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import Flavor from "../../../../shared/models/flavor.model";
import Image from "../../../../shared/models/image";
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../../shared/models/security-group";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {SecurityGroupService} from "../../../../shared/services/security-group.service";

@Component({
    selector: 'one-portal-new-virtual-machine',
    templateUrl: './new-virtual-machine.component.html',
    styleUrls: ['./new-virtual-machine.component.less'],
})
export class NewVirtualMachineComponent implements OnInit, OnChanges{

    @Input() region: number
    @Input() project: number

    validateForm: FormGroup<{
        name: FormControl<string>
        flavor: FormControl<Flavor | null>
        image: FormControl<Image | null>
        securityGroup: FormControl<SecurityGroup | null>
        iops: FormControl<number>
        storage: FormControl<number>
        radio: FormControl<any>
    }> = this.fb.group({
        name: ['', [Validators.required]],
        flavor: [null as Flavor | null, [Validators.required]],
        image: [null as Image | null, [Validators.required]],
        securityGroup: [null as SecurityGroup | null, [Validators.required]],
        iops: [null as number | null, [Validators.required]],
        storage: [null as number | null, [Validators.required]],
        radio: [''],
    })

    conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition()
    securityGroupLst: SecurityGroup[]
    isSelectedSecurityGroup: SecurityGroup

    constructor(private location: Location,
                private fb: NonNullableFormBuilder,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private securityGroupService: SecurityGroupService) {
    }

    goBack() {
        this.location.back();
    }

    handleSecurityGroupChange(securityGroup: SecurityGroup) {
        this.validateForm.controls.securityGroup.setValue(securityGroup)
    }

    getSecurityGroup() {
        this.conditionSearch.userId = this.tokenService.get()?.userId
        this.conditionSearch.regionId = this.region
        this.conditionSearch.projectId = this.project
        if (this.conditionSearch.regionId && this.conditionSearch.userId && this.conditionSearch.projectId) {
            this.securityGroupService.search(this.conditionSearch)
                .subscribe((data) => {
                    this.securityGroupLst = data;
                    console.log('sg', this.securityGroupLst)
                })
        }
    }

    handleFlavorChange(flavor: Flavor) {
        this.validateForm.controls.flavor.setValue(flavor)
    }

    handleImageChange(image: Image) {
        this.validateForm.controls.image.setValue(image)
    }

    submitForm(){
    }

    ngOnInit(): void {
        this.region = JSON.parse(localStorage.getItem('region')).regionId;
        this.project = JSON.parse(localStorage.getItem('projectId'));
    }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes.project) {
        this.getSecurityGroup()
      }
  }
}
