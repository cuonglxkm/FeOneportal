import { Component, Inject, OnInit } from '@angular/core';
import {
  PaymentModel,
  PaymentSearch,
} from '../../../../shared/models/payment.model';
import {
  BaseResponse,
  NotificationService,
  ProjectModel,
  RegionModel,
} from '../../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { PaymentService } from '../../../../shared/services/payment.service';
import { Router } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LoadingService } from '@delon/abc/loading';
import { debounceTime, finalize, Subject } from 'rxjs';
import { TimeCommon } from 'src/app/shared/utils/common';
import { format } from 'date-fns';
@Component({
  selector: 'one-portal-list-payment',
  templateUrl: './list-payment.component.html',
  styleUrls: ['./list-payment.component.less'],
})
export class ListPaymentComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValue?: string = '';
  selectedValueInvoice?: number = 0;
  value?: string;

  customerId: number;
  pageSize: number = 10;
  pageIndex: number = 1;

  isLoading: boolean = false;

  searchDelay = new Subject<boolean>();

  status = [
    { label: this.i18n.fanyi('app.payment.status.all'), value: '' },
    { label: this.i18n.fanyi('app.payment.status.paid'), value: 'PAID' },
    { label: this.i18n.fanyi('app.payment.status.unpaid'), value: 'INIT' },
    { label: this.i18n.fanyi('app.payment.status.cancel'), value: 'FAILED' },
  ];

  statusInvoice = [
    { label: this.i18n.fanyi('app.payment.status.all'), value: 0 },
    { label: this.i18n.fanyi('app.status.success'), value: 1 },
    { label: this.i18n.fanyi('app.status.fail'), value: 2 },
  ];

  dateFormat = 'dd/MM/yyyy';

  checked = false;
  loading = false;
  indeterminate = false;

  listOfData: readonly PaymentModel[] = [];
  listFilteredData: readonly PaymentModel[] = [];
  listOfCurrentPageData: readonly PaymentModel[] = [];

  setOfCheckedId = new Set<number>();

  downloadList: readonly PaymentModel[] = [];

  response: BaseResponse<PaymentModel[]>;

  dateRange: Date[] | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  fromDateFormatted: string | null = null;
  toDateFormatted: string | null = null;
  formSearch: PaymentSearch = new PaymentSearch();

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private paymentService: PaymentService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notificationService: NotificationService,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    this.customerId = this.tokenService.get()?.userId;
    this.searchDelay
      .pipe(debounceTime(TimeCommon.timeOutSearch))
      .subscribe(() => {
        this.refreshParams()
        this.getListInvoices();
      });
    if (this.notificationService.connection == undefined) {
      this.notificationService.initiateSignalrConnection();
    }
    this.notificationService.connection.on('UpdateStatePayment', (data) => {
      this.getListInvoices();
    });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  onChange(value: string) {
    this.selectedValue = value;
    this.getListInvoices();
  }

  search(search: string) {
    this.value = search.toUpperCase().trim();
    this.refreshParams()
    this.getListInvoices();
  }

  onChangeInvoice(value: number) {
    this.selectedValueInvoice = value;
    this.getListInvoices();
  }

  onDateRangeChange(value: Date[]): void {
    if (value && value.length === 2) {
      this.dateRange = value;
      this.fromDate = value[0];
      this.toDate = value[1];
      this.fromDateFormatted = format(value[0], 'yyyy-MM-dd');
      this.toDateFormatted = format(value[1], 'yyyy-MM-dd');
      this.getListInvoices()
    } else {
      this.fromDate = null;
      this.toDate = null;
      this.fromDateFormatted = null;
      this.toDateFormatted = null;
      this.getListInvoices()
    }
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const { pageSize, pageIndex } = params;
    this.pageSize = pageSize;
    this.pageIndex = pageIndex;
    this.getListInvoices();
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    for (let item of this.response.records) {
      item.checked = this.setOfCheckedId.has(item.id);
      item.indeterminate = this.setOfCheckedId.has(item.id) && !item.checked;
    }
    this.downloadList = this.response.records.filter(
      (data) => this.setOfCheckedId.has(data.id) && !!data.eInvoiceCode
    );
  }

  onCurrentPageDataChange(
    listOfCurrentPageData: readonly PaymentModel[]
  ): void {
    listOfCurrentPageData = this.response.records;
    this.refreshCheckedStatus();
  }
  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.response.records.forEach((item) =>
      this.updateCheckedSet(item.id, value)
    );
    this.refreshCheckedStatus();
  }

  getListInvoices() {
    this.formSearch.customerId = this.tokenService.get()?.userId;
    if (this.value === null || this.value === undefined) {
      this.formSearch.code = '';
    } else {
      this.formSearch.code = this.value.toUpperCase().trim();
    }
    this.formSearch.status = this.selectedValue;
    if (this.dateRange?.length > 0) {
      this.formSearch.fromDate = this.fromDateFormatted;
      this.formSearch.toDate = this.toDateFormatted;
    } else {
      this.formSearch.fromDate = '';
      this.formSearch.toDate = '';
    }
    this.formSearch.pageSize = this.pageSize;
    this.formSearch.currentPage = this.pageIndex;
    this.formSearch.invoiceStatus = this.selectedValueInvoice;
    this.isLoading = true;
    this.paymentService.search(this.formSearch).subscribe(
      (data) => {
        this.isLoading = false;
        this.response = data;
        this.listFilteredData = data.records;
        this.response.records = this.response.records.map((item) => {
          return {
            ...item,
            eInvoiceCodePadded:
              item.eInvoiceCode != null
                ? item.eInvoiceCode.toString().padStart(8, '0')
                : null,
          };
        });
      },
      (error) => {
        this.isLoading = false;
        this.response = null;
        console.log('error', error.error);
      }
    );
  }

  pad(n) {
    return n < 8 ? '0' + n : n;
  }


  refreshParams() {
    this.pageSize = 10;
    this.pageIndex = 1;
  }

  downloadMany() {
    this.downloadList
      .map((item) => item.eInvoiceCode)
      .map((id) => {
        this.serviceDownload(id);
      });
  }

  serviceDownload(id: number) {
    this.paymentService.exportInvoice(id).subscribe(
      (data) => {
        const element = document.createElement('div');
        element.style.width = '268mm';
        element.style.height = '371mm';
        if (typeof data === 'string' && data.trim().length > 0) {
          element.innerHTML = data;

          document.body.appendChild(element);

          html2canvas(element).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            pdf.save(`invoice_${id}.pdf`);

            document.body.removeChild(element);
          });
        } else {
          console.log('error:', data);
        }
      },
      (error) => {
        console.log('error:', error);
      }
    );
  }


  getPaymentDetail(data: any) {
    this.router.navigate([
      '/app-smart-cloud/billing/payments/detail/' +
        data.id +
        '/' +
        data.orderNumber,
    ]);
  }

  getOrderDetail(ordernumber: any) {
    this.router.navigate(['/app-smart-cloud/order/detail/' + ordernumber]);
  }

  printInvoice(id: number) {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.paymentService
      .exportInvoice(id)
      .pipe(finalize(() => this.loadingSrv.close()))
      .subscribe(
        (data) => {
          const element = document.createElement('div');
          element.style.width = '268mm';
          element.style.height = '371mm';
          if (typeof data === 'string' && data.trim().length > 0) {
            element.innerHTML = data;

            document.body.appendChild(element);

            html2canvas(element).then((canvas) => {
              const imgData = canvas.toDataURL('image/jpeg', 1.0);
              const pdf = new jsPDF('p', 'mm', 'a4');
              pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
              window.open(pdf.output('bloburl'), '_blank');
              document.body.removeChild(element);
            });
          } else {
            console.log('error:', data);
          }
        },
        (error) => {
          console.log('error:', error);
        }
      );
  }
}
