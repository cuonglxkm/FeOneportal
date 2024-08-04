import { AfterViewInit, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Summary } from '../../../shared/models/object-storage.model';
import { Line } from '@antv/g2plot';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  @Input() timeSelected: any;

  newDate: Date = new Date();
  @ViewChild('chartStorageUse') chartStorageUse!: ElementRef;
  @ViewChild('storageUse') storageUse!: ElementRef;

  @ViewChild('chartNumberObject') chartNumberObject!: ElementRef;
  @ViewChild('numberObject') numberObject!: ElementRef;

  @ViewChild('chartStorageUpload') chartStorageUpload!: ElementRef;
  @ViewChild('storageUpload') storageUpload!: ElementRef;

  @ViewChild('chartStorageDownload') chartStorageDownload!: ElementRef;
  @ViewChild('storageDownload') storageDownload!: ElementRef;
  @ViewChild('fullscreenContainer', { static: false })
  fullscreenContainer: ElementRef;
  @ViewChild('fullscreenImage', { static: false }) fullscreenImage: ElementRef;
  lineChartStorageUse: Line;
  lineChartNumberObject: Line;
  lineChartStorageUpload: Line;
  lineChartStorageDownload: Line;

  bytesConvert(bytes, label) {
    if (bytes == 0) return '0 byte';
    var s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    var value = (bytes / Math.pow(1024, Math.floor(e))).toFixed(2);
    e = e < 0 ? -e : e;
    if (label) value += ' ' + s[e];
    return value;
  }

  createChartStorageUse() {
    let data = this.summary[0]?.datas?.map((item) => ({
      year: this.transform(item.timeSpan),
      value: this.bytesConvert(item.value, true)
    }));
    console.log(this.timeSelected)

    console.log('data', data);
    // Cập nhật biểu đồ hoặc tạo mới
    if (this.lineChartStorageUse) {
      this.lineChartStorageUse.changeData(data);
    } else {
      this.lineChartStorageUse = new Line(this.chartStorageUse.nativeElement, {
        data,
        xField: 'year',
        yField: 'value'
      });
      this.lineChartStorageUse.render();
    }
  }

  createNumberObject() {
    let data = this.summary[1]?.datas?.map((item) => ({
      year: this.transform(item.timeSpan),
      value: item.value
    }));

    if (this.lineChartNumberObject) {
      this.lineChartNumberObject.changeData(data);
    } else {
      this.lineChartNumberObject = new Line(
        this.chartNumberObject.nativeElement,
        {
          data,
          xField: 'year',
          yField: 'value',
          color: 'green'
        }
      );

      this.lineChartNumberObject.render();
    }
  }

  createStorageUpload() {
    let data = this.summary[2]?.datas?.map((item) => ({
      year: this.transform(item.timeSpan),
      value: this.bytesConvert(item.value, true)
    }));

    if (this.lineChartStorageUpload) {
      this.lineChartStorageUpload.changeData(data);
    } else {
      this.lineChartStorageUpload = new Line(
        this.chartStorageUpload.nativeElement,
        {
          data,
          xField: 'year',
          yField: 'value',
          color: 'brown'
        }
      );

      this.lineChartStorageUpload.render();
    }
  }

  createStorageDownload() {
    let data = this.summary[3]?.datas?.map((item) => ({
      year: this.transform(item.timeSpan),
      value: this.bytesConvert(item.value, true)
    }));

    if (this.lineChartStorageDownload) {
      this.lineChartStorageDownload.changeData(data);
    } else {
      this.lineChartStorageDownload = new Line(
        this.chartStorageDownload.nativeElement,
        {
          data,
          xField: 'year',
          yField: 'value',
          color: 'orange'
        }
      );

      this.lineChartStorageDownload.render();
    }
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

    html2canvas(element.nativeElement).then((canvas) => {
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
    } else if (fullscreenContainer.mozRequestFullScreen) {
      // Firefox
      fullscreenContainer.mozRequestFullScreen();
    } else if (fullscreenContainer.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      fullscreenContainer.webkitRequestFullscreen();
    } else if (fullscreenContainer.msRequestFullscreen) {
      // IE/Edge
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
        html2canvas(this.storageUse.nativeElement).then((canvas) => {
          const contentDataURL = canvas.toDataURL('image/png');
          let pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
          var pdfWidth = pdf.internal.pageSize.getWidth();
          var pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(contentDataURL, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          //  pdf.save('new-file.pdf');
          window.open(pdf.output('bloburl'), '_blank');
        });

        break;
      case 'number-object':
        html2canvas(this.numberObject.nativeElement).then((canvas) => {
          const contentDataURL = canvas.toDataURL('image/png');
          let pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
          var pdfWidth = pdf.internal.pageSize.getWidth();
          var pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(contentDataURL, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          //  pdf.save('new-file.pdf');
          window.open(pdf.output('bloburl'), '_blank');
        });
        break;
      case 'storage-upload':
        html2canvas(this.storageUpload.nativeElement).then((canvas) => {
          const contentDataURL = canvas.toDataURL('image/png');
          let pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
          var pdfWidth = pdf.internal.pageSize.getWidth();
          var pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(contentDataURL, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          //  pdf.save('new-file.pdf');
          window.open(pdf.output('bloburl'), '_blank');
        });
        break;
      case 'storage-download':
        html2canvas(this.storageDownload.nativeElement).then((canvas) => {
          const contentDataURL = canvas.toDataURL('image/png');
          let pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
          var pdfWidth = pdf.internal.pageSize.getWidth();
          var pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(contentDataURL, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          //  pdf.save('new-file.pdf');
          window.open(pdf.output('bloburl'), '_blank');
        });
        break;
      default:
        break;
    }
  }

  print(url: string) {
    const dataUrl = url;
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(
        '<html><head><title>Monitor Print</title></head><body>'
      );
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
          html2canvas(this.storageUse.nativeElement).then((canvas) => {
            this.download(canvas.toDataURL('image/png'), '/png', 'storage-use');
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.storageUse.nativeElement).then((canvas) => {
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
        if (extension.includes('png')) {
          html2canvas(this.numberObject.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/png'),
              '/png',
              'number-object'
            );
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.numberObject.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/png'),
              '/jpg',
              'number-object'
            );
          });
        }
        if (extension.includes('pdf')) {
          this.downloadPDF(type);
        }
        if (extension.includes('svg')) {
          this.downloadSVG(type);
        }
        break;
      case 'storage-upload':
        if (extension.includes('png')) {
          html2canvas(this.storageUpload.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/png'),
              '/png',
              'storage-upload'
            );
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.storageUpload.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/png'),
              '/jpg',
              'storage-upload'
            );
          });
        }
        if (extension.includes('pdf')) {
          this.downloadPDF(type);
        }
        if (extension.includes('svg')) {
          this.downloadSVG(type);
        }
        break;
      case 'storage-download':
        if (extension.includes('png')) {
          html2canvas(this.storageDownload.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/png'),
              '/png',
              'storage-download'
            );
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.storageDownload.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/png'),
              '/jpg',
              'storage-download'
            );
          });
        }
        if (extension.includes('pdf')) {
          this.downloadPDF(type);
        }
        if (extension.includes('svg')) {
          this.downloadSVG(type);
        }
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
    switch (type) {
      case 'storage-use':
        html2canvas(this.storageUse.nativeElement).then((canvas) => {
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
        break;
      case 'number-object':
        html2canvas(this.numberObject.nativeElement).then((canvas) => {
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
        break;
      case 'storage-upload':
        html2canvas(this.storageUpload.nativeElement).then((canvas) => {
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
        break;
      case 'storage-download':
        html2canvas(this.storageDownload.nativeElement).then((canvas) => {
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
        break;
      default:
        break;
    }
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.summary && !changes.summary.firstChange) {
      this.createChartStorageUse();
      this.createNumberObject();
      this.createStorageUpload();
      this.createStorageDownload();
    }
  }

  ngOnInit() {
    document.addEventListener(
      'fullscreenchange',
      this.fullscreenChangeHandler.bind(this)
    );
    document.addEventListener('keydown', this.keydownHandler.bind(this));
    console.log('time selected', this.timeSelected);
  }

  ngOnDestroy() {
    document.removeEventListener(
      'fullscreenchange',
      this.fullscreenChangeHandler.bind(this)
    );
    document.removeEventListener('keydown', this.keydownHandler.bind(this));
  }

  getFormattedStartDate(timestamp) {
    return new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  }

  transform(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    let returnLabel = '';
    switch (this.timeSelected) {
      case 5:
        returnLabel = `${hours}:${minutes}`;
        break;
      case 15:
        returnLabel = `${hours}:${minutes}`;
        break;
      case 60:
        returnLabel = `${hours}:${minutes}`;
        break;
      case 1440:
          returnLabel = `${hours}:00`;
        break;
      case 10080:
        returnLabel = `${day}/${month}/${year}`;
        break;
      case 43200:
        returnLabel = `${day}/${month}/${year}`;
        break;
      case 129600:
        returnLabel = `${day}/${month}/${year}`;
        break;
      default:
        returnLabel = `${hours}:${minutes}`;
    }

    return returnLabel;
  }

  ngAfterViewInit(): void {
    this.createChartStorageUse();
    this.createNumberObject();
    this.createStorageUpload();
    this.createStorageDownload();
  }
}
