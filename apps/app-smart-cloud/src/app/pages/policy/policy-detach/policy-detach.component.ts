import {Component, OnInit} from '@angular/core';
import {ProjectModel} from "../../../shared/models/project.model";
import {RegionModel} from "../../../shared/models/region.model";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {ActivatedRoute} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PopupDetachPolicyComponent} from "../popup-policy/popup-detach-policy.component";


export interface Data {
  id: number;
  name: string;
  type: number;
}
@Component({
  selector: 'one-portal-policy-detach',
  templateUrl: './policy-detach.component.html',
  styleUrls: ['./policy-detach.component.less'],
})
export class PolicyDetachComponent implements OnInit {

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

  detachPolicy(){
    const requestData = this.listOfData.filter(data => this.setOfCheckedId.has(data.id));

    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Detach Policy',
      nzContent:PopupDetachPolicyComponent,
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
            this.doDetachPolicy(requestData, this.idPolicy);
            modal.destroy()
          }
        }
      ]
    });

  }
  private doDetachPolicy(requestData: Data[] , idPolicy: number){
    console.log(requestData);
    console.log("idPolicy: "+ idPolicy);
    this.notification.success('Thành công', 'Gỡ Policy thành công');
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
  constructor(
    private activatedRoute: ActivatedRoute,
    private modalService: NzModalService,
    private notification: NzNotificationService,) {
  }

}
