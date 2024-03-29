import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Summary } from '../../../shared/models/object-storage.model';
import { Line } from '@antv/g2plot';
import html2canvas from 'html2canvas';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { jsPDF } from 'jspdf';
import { Router } from '@angular/router';
import { Chart } from '@antv/g2';
import { now } from 'lodash';

export class DataChart {
  time: any
  data: any
}
@Component({
  selector: 'one-portal-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less']
})
export class ChartComponent implements AfterViewInit {
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
    const data:any = [10,39,20,76,3,15]
    const startDate = new Date(this.summary[0].startDate * 1000); // Example start date
    const endDate = new Date(); // Example end date

    const chartStorageUse = new Chart({
      container: this.chartStorageUse.nativeElement,
      autoFit: true,
      height: 400,
    });
    chartStorageUse.data(data)
    chartStorageUse.scale({
      date: {
        type: 'time',
        range: [0, 1],
        nice: true,
        min: startDate.getTime(), // Set minimum date to start date
        max: endDate.getTime() // Set maximum date to end date
      },
      value: {
        min: 0, // Optional: Set minimum value for y-axis
        max: 30
      }
    });
    chartStorageUse.line().position('date*value').shape('smooth');
    chartStorageUse.render();
  }

  createNumberObject() {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];
    const line = new Line(this.chartNumberObject.nativeElement, {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createStorageUpload() {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];
    const line = new Line(this.chartStorageUpload.nativeElement, {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createStorageDownload() {
    const data = [
      { year: '1991', value: 2 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 3 },
      { year: '1998', value: 8 },
      { year: '1999', value: 13 }
    ];
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
          this.viewFull(canvas.toDataURL())
        })
        break;
      case 'number-object':
        html2canvas(this.numberObject.nativeElement).then(canvas => {
          this.viewFull(canvas.toDataURL())
        })
        break;
      case 'storage-upload':
        html2canvas(this.storageUpload.nativeElement).then(canvas => {
          this.viewFull(canvas.toDataURL())
        })
        break;
      case 'storage-download':
        html2canvas(this.storageDownload.nativeElement).then(canvas => {
          this.viewFull(canvas.toDataURL())
        })
        break;
      default:
        break;
    }
  }

  viewFull(url: string) {

  }

  printChartStorageUse(type) {
    switch (type) {
      case 'storage-use':
        html2canvas(this.storageUse.nativeElement).then(canvas => {
          this.print(canvas.toDataURL('image/png'))
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
    const dataUrl = url
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
        if(extension.includes('png')) {
          html2canvas(this.storageUse.nativeElement).then(canvas => {
            this.download(canvas.toDataURL('image/png'), '/png', 'storage-use')
          });
        }
        if(extension.includes('jpg')) {
          html2canvas(this.storageUse.nativeElement).then(canvas => {
            this.download(canvas.toDataURL('image/png'), '/jpg', 'storage-use')
          });
        }
        if(extension.includes('pdf')) {
          this.downloadPDF(type)
        }
        if(extension.includes('svg')) {
          this.downloadSVG(type)
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
    const dataUrl = url
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
    html2canvas(this.storageUse.nativeElement).then(canvas => {

    });
  }

  ngAfterViewInit(): void {
    this.createChartStorageUse();
    this.createNumberObject();
    this.createStorageUpload();
    this.createStorageDownload();
  }
}
