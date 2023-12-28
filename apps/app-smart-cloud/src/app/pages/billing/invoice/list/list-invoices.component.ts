import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {PaymentService} from "../../../../shared/services/payment.service";
import {BaseResponse} from '../../../../../../../../libs/common-utils/src';
import {PaymentModel, PaymentSearch} from "../../../../shared/models/payment.model";

@Component({
  selector: 'one-portal-list-invoices',
  templateUrl: './list-invoices.component.html',
  styleUrls: ['./list-invoices.component.less'],
})
export class ListInvoicesComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValue?: string = null
  value?: string;

  customerId: number
  pageSize: number = 10
  pageIndex: number = 1

  isLoading: boolean = false

  status = [
    {label: 'Tất cả', value: 'all'},
    {label: 'Đã thanh toán', value: 'ACTIVE'},
    {label: 'Chưa thanh toán', value: 'DISABLED'}
  ]

  dateFormat = 'dd/MM/yyyy';

  checked = false;
  loading = false;
  indeterminate = false;
  listOfData: readonly PaymentModel[] = [];
  listOfCurrentPageData: readonly PaymentModel[] = [];
  setOfCheckedId = new Set<number>();

  response: BaseResponse<PaymentModel[]>


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private paymentService: PaymentService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  onChange(value: string) {
    console.log('abc', this.selectedValue)
    if (value === 'all') {
      this.selectedValue = ''
    } else {
      this.selectedValue = value;
    }
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly PaymentModel[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData
    this.checked = listOfEnabledData.every(({id}) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({id}) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({id}) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  getListInvoices() {
    const formSearch: PaymentSearch = new PaymentSearch()
    formSearch.customerId = this.customerId
    if (this.value === null || this.value === undefined) {
      formSearch.code = ''
    } else {
      formSearch.code = this.value
    }
    formSearch.pageSize = this.pageSize
    formSearch.currentPage = this.pageIndex
    this.isLoading = true
    this.paymentService.search(formSearch).subscribe(data => {
      this.isLoading = false
      this.response = data
      this.listOfData = data.records
    }, error => {
      this.isLoading = false
      this.response = null
      console.log('error', error.error)
    })
  }

  handleFileDownload(downloadUrl: string) {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank'; // Open the link in a new tab/window
    link.click();
  }

  ngOnInit(): void {
    this.customerId = this.tokenService.get()?.userId
    this.getListInvoices()
  }
}
