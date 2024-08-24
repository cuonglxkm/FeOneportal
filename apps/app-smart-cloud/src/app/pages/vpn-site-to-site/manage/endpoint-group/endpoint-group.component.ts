import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  Component,
  Inject,
  Input,
  SimpleChanges,
} from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import {
  EndpointGroupDTO,
  FormSearchEndpointGroup,
} from 'src/app/shared/models/endpoint-group';
import { EndpointGroupService } from 'src/app/shared/services/endpoint-group.service';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { TimeCommon } from 'src/app/shared/utils/common';

@Component({
  selector: 'one-portal-endpoint-group',
  templateUrl: './endpoint-group.component.html',
  styleUrls: ['./endpoint-group.component.less'],
})
export class EndpointGroupComponent {
  @Input() region: number;
  @Input() project: number;
  customerId: number;

  pageSize: number = 5;
  pageIndex: number = 1;
  pageSizeFixed = 5
  value: string = '';

  response: BaseResponse<EndpointGroupDTO>;

  isLoading: boolean = false;

  searchDelay = new Subject<boolean>();

  formSearchEnpointGroup: FormSearchEndpointGroup =
    new FormSearchEndpointGroup();

  constructor(
    private endpointGroupService: EndpointGroupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {}

  refreshParams() {
    this.pageSize = 5;
    this.pageIndex = 1;
  }

  search(search: string) {
    this.value = search.trim();
    this.refreshParams()
    this.getData();
  }

  onPageSizeChange(event) {
    this.pageSize = event;
    this.refreshParams();
    this.getData();
  }

  onPageIndexChange(event) {
    this.pageIndex = event;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.formSearchEnpointGroup.vpcId = this.project;
    this.formSearchEnpointGroup.regionId = this.region;
    this.formSearchEnpointGroup.name = this.value.trim();
    this.formSearchEnpointGroup.pageSize = this.pageSize;
    this.formSearchEnpointGroup.currentPage = this.pageIndex;
    this.endpointGroupService
      .getListEndpointGroup(this.formSearchEnpointGroup)
      .subscribe((data) => {
        this.isLoading = false;
        console.log('data', data);
        this.response = data;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.project && !changes.project.firstChange) {
      this.getData();
    }
    if (changes.region && !changes.region.firstChange) {
      this.refreshParams();
    }
  }

  handleOkDelete(){
    this.getData()
  }

  handleOkEdit(){
    this.getData()
  }

  ngOnInit() {
    this.getData();
    this.searchDelay.pipe(debounceTime(1200)).subscribe(() => {
      this.refreshParams()
      this.getData();
    });
  }
}
