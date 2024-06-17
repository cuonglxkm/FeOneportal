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
  @ViewChild('fullscreenContainer', { static: false }) fullscreenContainer: ElementRef;
  @ViewChild('fullscreenImage', { static: false }) fullscreenImage: ElementRef;


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

  viewFullscreen(type: string): void {
    let element: ElementRef;

    switch (type) {
      case 'storage-use':
        element = this.storageUse;
        break;
      case 'number-object':
        element = this.numberObject;
        break;
      case 'storage-upload':
        element = this.storageUpload;
        break;
      case 'storage-download':
        element = this.storageDownload;
        break;
      default:
        return;
    }

    html2canvas(element.nativeElement).then(canvas => {
      const imageDataUrl = canvas.toDataURL();
      this.showFullscreenImage(imageDataUrl);
    });
  }

  showFullscreenImage(imageDataUrl: string): void {
    const fullscreenContainer = this.fullscreenContainer.nativeElement;
    const fullscreenImage = this.fullscreenImage.nativeElement;

    fullscreenImage.src = imageDataUrl;
    fullscreenContainer.style.display = 'block';

    if (fullscreenContainer.requestFullscreen) {
      fullscreenContainer.requestFullscreen();
    } else if (fullscreenContainer.mozRequestFullScreen) { // Firefox
      fullscreenContainer.mozRequestFullScreen();
    } else if (fullscreenContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
      fullscreenContainer.webkitRequestFullscreen();
    } else if (fullscreenContainer.msRequestFullscreen) { // IE/Edge
      fullscreenContainer.msRequestFullscreen();
    }
  }

  fullscreenChangeHandler(): void {
    if (!document.fullscreenElement) {
      this.exitFullscreen();
    }
  }

  keydownHandler(event: KeyboardEvent): void {
    if (event.key === 'Escape' && document.fullscreenElement) {
      this.exitFullscreen();
    }
  }

  exitFullscreen(): void {
    const fullscreenContainer = this.fullscreenContainer.nativeElement;
    fullscreenContainer.style.display = 'none';

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  viewFull(url: string) {
    // const imageElement = this.imageElement.nativeElement as HTMLImageElement;
  }

  printChartStorageUse(type) {
    switch (type) {
      case 'storage-use':
        html2canvas(this.storageUse.nativeElement).then(canvas => {
          const contentDataURL = canvas.toDataURL('image/png')
          let pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
          var pdfWidth = pdf.internal.pageSize.getWidth();
          var pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(contentDataURL, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          //  pdf.save('new-file.pdf');
          window.open(pdf.output('bloburl'), '_blank');
        });
        
        break;
      case 'number-object':
        html2canvas(this.numberObject.nativeElement).then(canvas => {
          const contentDataURL = canvas.toDataURL('image/png')
          let pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
          var pdfWidth = pdf.internal.pageSize.getWidth();
          var pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(contentDataURL, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          //  pdf.save('new-file.pdf');
          window.open(pdf.output('bloburl'), '_blank');
        });
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
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler.bind(this));
    document.addEventListener('keydown', this.keydownHandler.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler.bind(this));
    document.removeEventListener('keydown', this.keydownHandler.bind(this));
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
