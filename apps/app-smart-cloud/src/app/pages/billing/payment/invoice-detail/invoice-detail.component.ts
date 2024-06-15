import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  SecurityContext
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { finalize, Observable } from 'rxjs';
import { OrderDetailDTO } from 'src/app/shared/models/order.model';
import { PaymentModel } from 'src/app/shared/models/payment.model';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { UserModel } from '../../../../../../../../libs/common-utils/src';
class ServiceInfo {
  name: string;
  price: number;
  duration: number;
  amount: number;
  currency: number;
}

@Component({
  selector: 'one-portal-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailComponent implements OnInit {
  payment: PaymentModel = new PaymentModel();
  serviceInfo: ServiceInfo = new ServiceInfo();
  data: OrderDetailDTO;
  userModel$: Observable<UserModel>;
  id: number;
  userModel: UserModel;
  element: any;
  constructor(
    private service: PaymentService,
    private activatedRoute: ActivatedRoute,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private sanitizer: DomSanitizer,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getInvoice(this.id);
  }

  getInvoice(id: number) {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service.exportInvoice(id).pipe(finalize(() => this.loadingSrv.close())).subscribe(
      (data) => {
        const sanitizedData = this.sanitizer.sanitize(
          SecurityContext.HTML,
          this.sanitizer.bypassSecurityTrustHtml(data)
        );

        const scriptLoaderElement = document.getElementById('myScriptLoader');
        scriptLoaderElement.innerHTML = sanitizedData;
      },
      (error) => {
        console.log('error:', error);
      }
    );
  }

  downloadInvoice(){
    this.service.exportInvoice(this.id).subscribe((data) => {
      const element = document.createElement('div');
      element.style.width = '268mm';
      element.style.height = '371mm';
      if (typeof data === 'string' && data.trim().length > 0) {
        element.innerHTML = data;
        
        document.body.appendChild(element);
        
        html2canvas(element).then(canvas => {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
          pdf.save(`invoice_${this.id}.pdf`);
          pdf.autoPrint()
          pdf.output('dataurlnewwindow');
          document.body.removeChild(element);
        });
      } else {
        console.log('error:', data);
      }
    }, (error) => {
      console.log('error:', error);
    });
  }
}
