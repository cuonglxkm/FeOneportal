import {Component, OnInit} from '@angular/core';
import {ProjectModel} from "../../../shared/models/project.model";
import {RegionModel} from "../../../shared/models/region.model";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {ActivatedRoute} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupAttachPolicy} from "../popup-policy/popup-attach-policy";


export interface Data {
  id: number;
  name: string;
  type: number;
}
@Component({
  selector: 'one-portal-policy-attach-detach',
  templateUrl: './policy-attach-detach.component.html',
  styleUrls: ['./policy-attach-detach.component.less'],
})
export class PolicyAttachDetachComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  entitiesStatusSearch : string;

  entitiesNameSearch : string;

  optionsEntities : NzSelectOptionInterface[] = [
    {label: 'Tất cả các loại', value: null},
    {label: 'Users', value: 'USER'},
    {label: 'Users Groups', value: 'GROUP'},

  ];

  idPolicy : number;
  checked = false;
  indeterminate = false;
  listOfData: readonly Data[] = [];
  listOfCurrentPageData: readonly Data[] = [];
  setOfCheckedId = new Set<number>();


  searchEntities(){

  }


  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Data[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  attachPolicy(){
    const requestData = this.listOfData.filter(data => this.setOfCheckedId.has(data.id));

    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Attach Policy',
      nzContent:PopupAttachPolicy,
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => modal.destroy()
        },
        {
          label: 'Đồng ý',
          type: 'primary',
          onClick: () => {
            this.doAttachPolicy(requestData, this.idPolicy);
            modal.destroy()
          }
        }
      ]
    });

  }
  private doAttachPolicy(requestData: Data[] , idPolicy: number){
    console.log(requestData);
    console.log("idPolicy: "+ idPolicy);
  }

  goBack(){

  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }
  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  ngOnInit(): void {
    this.idPolicy = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));


    this.listOfData = new Array(100).fill(0).map((_, index) => ({
      id: index,
      name: `Edward King ${index}`,
      type: index%2,
    }));
  }
  constructor(private activatedRoute: ActivatedRoute,private modalService: NzModalService) {
  }

}
