import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Summary } from '../../../shared/models/object-storage.model';
import { Line } from '@antv/g2plot';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Chart } from '@antv/g2';

export class DataChart {
  time: any;
  data: any;
}

@Component({
  selector: 'one-portal-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less']
})
export class ChartComponent implements AfterViewInit, OnInit {
  @Input() summary: Summary[];
  newDate: Date = new Date();
  @ViewChild('chartStorageUse') chartStorageUse!: ElementRef;
  @ViewChild('storageUse') storageUse!: ElementRef;

  @ViewChild('chartNumberObject') chartNumberObject!: ElementRef;
  @ViewChild('numberObject') numberObject!: ElementRef;

  @ViewChild('chartStorageUpload') chartStorageUpload!: ElementRef;
  @ViewChild('storageUpload') storageUpload!: ElementRef;

  @ViewChild('chartStorageDownload') chartStorageDownload!: ElementRef;
  @ViewChild('storageDownload') storageDownload!: ElementRef;


  createChartStorageUse() {
    const data = this.summary[0]?.datas?.map(item => ({ year: this.transform(item.timeSpan), value: item.value }));

    console.log('data', data)
    const line = new Line(this.chartStorageUse.nativeElement, {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createNumberObject() {
    const data = this.summary[1]?.datas?.map(item => ({ year: this.transform(item.timeSpan), value: item.value }));

    console.log('data', data)
    const line = new Line(this.chartNumberObject.nativeElement, {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createStorageUpload() {
    const data = this.summary[2]?.datas?.map(item => ({ year: this.transform(item.timeSpan), value: item.value }));
    const line = new Line(this.chartStorageUpload.nativeElement, {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createStorageDownload() {
    const data = this.summary[3]?.datas?.map(item => ({ year: this.transform(item.timeSpan), value: item.value }));
    const line = new Line(this.chartStorageDownload.nativeElement, {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  viewFullscreen(type) {
    switch (type) {
      case 'storage-use':
        html2canvas(this.storageUse.nativeElement).then(canvas => {
          this.viewFull(canvas.toDataURL());
        });
        break;
      case 'number-object':
        html2canvas(this.numberObject.nativeElement).then(canvas => {
          this.viewFull(canvas.toDataURL());
        });
        break;
      case 'storage-upload':
        html2canvas(this.storageUpload.nativeElement).then(canvas => {
          this.viewFull(canvas.toDataURL());
        });
        break;
      case 'storage-download':
        html2canvas(this.storageDownload.nativeElement).then(canvas => {
          this.viewFull(canvas.toDataURL());
        });
        break;
      default:
        break;
    }
  }

  viewFull(url: string) {
    // const imageElement = this.imageElement.nativeElement as HTMLImageElement;
  }

  printChartStorageUse(type) {
    switch (type) {
      case 'storage-use':
        html2canvas(this.storageUse.nativeElement).then(canvas => {
          this.print(canvas.toDataURL('image/png'));
        });
        break;
      case 'number-object':

        break;
      case 'storage-upload':
        break;
      case 'storage-download':
        break;
      default:
        break;
    }
  }

  print(url: string) {
    const dataUrl = url;
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write('<html><head><title>Monitor Print</title></head><body>');
      printWindow.document.write(`<img src="${dataUrl}"/>`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  downloadImage(type: String, extension: String) {
    switch (type) {
      case 'storage-use':
        if (extension.includes('png')) {
          html2canvas(this.storageUse.nativeElement).then(canvas => {
            this.download(canvas.toDataURL('image/png'), '/png', 'storage-use');
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.storageUse.nativeElement).then(canvas => {
            this.download(canvas.toDataURL('image/png'), '/jpg', 'storage-use');
          });
        }
        if (extension.includes('pdf')) {
          this.downloadPDF(type);
        }
        if (extension.includes('svg')) {
          this.downloadSVG(type);
        }
        break;
      case 'number-object':

        break;
      case 'storage-upload':
        break;
      case 'storage-download':
        break;
      default:
        break;
    }
  }

  download(url: string, extension: string, type: string) {
    const dataUrl = url;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = type + extension;
    link.click();
  }

  downloadPDF(type): void {
    html2canvas(this.storageUse.nativeElement).then(canvas => {
      const dataUrl = canvas.toDataURL('image/jpeg');
      // Create a new jsPDF instance

      const pdf = new jsPDF('p', 'mm', 'a4');
      const aspectRatio = canvas.width / canvas.height;
      let imgWidth = pdf.internal.pageSize.getWidth();
      let imgHeight = imgWidth / aspectRatio;

      // If the height exceeds the page height, adjust the height and width accordingly
      if (imgHeight > pdf.internal.pageSize.getHeight()) {
        imgHeight = pdf.internal.pageSize.getHeight();
        imgWidth = imgHeight * aspectRatio;
      }
      pdf.addImage(dataUrl, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(type + '.pdf');
    });
  }

  downloadSVG(type): void {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="red"/>
      </svg>
    `;

    // Convert SVG content to Blob
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = type + '.svg';

    // Append the link to the body and trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Cleanup
    document.body.removeChild(downloadLink);
  }

  ngOnInit() {
  }

  transform(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  ngAfterViewInit(): void {
    this.createChartStorageUse();
    this.createNumberObject();
    this.createStorageUpload();
    this.createStorageDownload();
  }
}
