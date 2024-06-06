import {Component, Inject, OnInit} from '@angular/core';
import {PaymentModel, PaymentSearch} from "../../../../shared/models/payment.model";
import {BaseResponse, ProjectModel, RegionModel} from "../../../../../../../../libs/common-utils/src";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {PaymentService} from "../../../../shared/services/payment.service";
import { Router } from '@angular/router';
import {NzTableQueryParams} from "ng-zorro-antd/table";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'

@Component({
  selector: 'one-portal-list-payment',
  templateUrl: './list-payment.component.html',
  styleUrls: ['./list-payment.component.less'],
})
export class ListPaymentComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValue?: string = null
  value?: string;

  customerId: number
  pageSize: number = 10
  pageIndex: number = 1

  isLoading: boolean = false

  status = [
    {label: this.i18n.fanyi('app.payment.status.all'), value: 'all'},
    {label: this.i18n.fanyi('app.payment.status.paid'), value: 'PAID'},
    {label: this.i18n.fanyi('app.payment.status.unpaid'), value: 'NO'}
  ]

  dateFormat = 'dd/MM/yyyy';

  checked = false;
  loading = false;
  indeterminate = false;

  listOfData: readonly PaymentModel[] = [];
  listFilteredData: readonly PaymentModel[] = [];
  listOfCurrentPageData: readonly PaymentModel[] = [];

  setOfCheckedId = new Set<number>();

  downloadList: readonly PaymentModel[] = [];

  response: BaseResponse<PaymentModel[]>

  dateRange: Date[] | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  formSearch: PaymentSearch = new PaymentSearch()

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private paymentService: PaymentService, private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
            ) {
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
    this.getListInvoices()
  }

  onDateRangeChange(value: Date[]): void {
    if(value) {
      this.dateRange = value
      this.fromDate = value[0]
      this.toDate = value[1]
      this.getListInvoices()
    } else {
      this.dateRange = null
      // this.fromDate = value[0]
      // this.toDate = value[1]
      this.getListInvoices()
    }
  }

  

  onInputChange(value: string) {
    this.value = value.toUpperCase();
    console.log('input text: ', this.value)
    this.getListInvoices()
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  // onCurrentPageDataChange(listOfCurrentPageData: readonly PaymentModel[]): void {
  //   this.listOfCurrentPageData = listOfCurrentPageData;
  //   this.refreshCheckedStatus();
  // }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSize = pageSize;
    this.pageIndex = pageIndex
    this.getListInvoices();
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
    this.downloadList = this.listOfData.filter(data => this.setOfCheckedId.has(data.id) && !!data.eInvoiceCode);
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly PaymentModel[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }
  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  getListInvoices() {
    this.formSearch.customerId = this.tokenService.get()?.userId
    if (this.value === null || this.value === undefined) {
      this.formSearch.code = ''
    } else {
      this.formSearch.code = this.value
    }

    if(this.selectedValue === 'all') {
      this.formSearch.status = ''
    }
    else {
      this.formSearch.status = this.selectedValue
    }
    if(this.dateRange?.length > 0) {
      this.formSearch.fromDate = this.dateRange[0].toLocaleString()
      this.formSearch.toDate = this.dateRange[1].toLocaleString()
    } else {
      this.formSearch.fromDate = ''
      this.formSearch.toDate = ''
    }
    this.formSearch.pageSize = this.pageSize
    this.formSearch.currentPage = this.pageIndex
    this.isLoading = true
    this.paymentService.search(this.formSearch).subscribe(data => {
      this.isLoading = false
      this.response = data
      this.listOfData = data.records
      this.listFilteredData = data.records
      this.listOfCurrentPageData = data.records
    }, error => {
      this.isLoading = false
      this.response = null
      console.log('error', error.error)
    })
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.getListInvoices();
  }

  disabledDate = (current: Date): boolean => {
    const now = new Date();
    // Nếu "from date" đã được chọn, tính 30 ngày từ "from date", ngược lại tính từ ngày hiện tại
    const startDate = this.fromDate || now;
    const thirtyDaysAgo = new Date(startDate);
    thirtyDaysAgo.setDate(startDate.getDate() - 30);

    const thirtyDaysLeft = new Date();
    thirtyDaysLeft.setDate(startDate.getDate() + 30);

    // Disable các ngày trước ngày tính từ "from date"
    return current < thirtyDaysAgo || current > thirtyDaysLeft;
  };

  downloadMany() {
    this.downloadList.map(item => item.eInvoiceCode).map((id) => {
      this.serviceDownload(id)
    })
  }

  serviceDownload(id: number) {
    this.paymentService.exportInvoice(id).subscribe((data) => {
      const element = document.createElement('div');
      
      if (typeof data === 'string' && data.trim().length > 0) {
        element.innerHTML = data;
        
        document.body.appendChild(element);
        
        html2canvas(element).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF();
          const aspectRatio = canvas.width / canvas.height;
          let imgWidth = pdf.internal.pageSize.getWidth();
          let imgHeight = imgWidth / aspectRatio;
    
          if (imgHeight > pdf.internal.pageSize.getHeight()) {
            imgHeight = pdf.internal.pageSize.getHeight();
            imgWidth = imgHeight * aspectRatio;
          }
          
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          
          pdf.save(`invoice_${id}.pdf`);
          
          document.body.removeChild(element);
        });
      } else {
        console.log('error:', data);
      }
    }, (error) => {
      console.log('error:', error);
    });
  }
  


  ngOnInit(): void {
    this.customerId = this.tokenService.get()?.userId
    // this.getListInvoices()
  }

  getPaymentDetail(data: any) {
    this.router.navigate(['/app-smart-cloud/billing/payments/detail/' + data.id +'/' + data.orderNumber]);
  }

  getOrderDetail(ordernumber: any) {
    this.router.navigate(['/app-smart-cloud/order/detail/' + ordernumber]);
  }
}
