import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef, Inject,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Summary } from '../../../shared/models/object-storage.model';
import { Line } from '@antv/g2plot';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Chart } from 'angular-highcharts';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import * as moment from 'moment';
@Component({
  selector: 'one-portal-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less']
})
export class ChartComponent implements AfterViewInit, OnInit {
  @Input() summary: Summary[];
  @Input() timeSelected: any;
  @Input() newDate: any;

  // @ViewChild('chartStorageUse') chartStorageUse!: ElementRef;
  @ViewChild('storageUse') storageUse!: ElementRef;
  //
  // @ViewChild('chartNumberObject') chartNumberObject!: ElementRef;
  @ViewChild('numberObject') numberObject!: ElementRef;
  //
  // @ViewChild('chartStorageUpload') chartStorageUpload!: ElementRef;
  @ViewChild('storageUpload') storageUpload!: ElementRef;
  //
  // @ViewChild('chartStorageDownload') chartStorageDownload!: ElementRef;
  @ViewChild('storageDownload') storageDownload!: ElementRef;
  @ViewChild('fullscreenContainer', { static: false })
  fullscreenContainer: ElementRef;
  @ViewChild('fullscreenImage', { static: false }) fullscreenImage: ElementRef;
  // lineChartStorageUse: Line;
  // lineChartNumberObject: Line;
  // lineChartStorageUpload: Line;
  lineChartStorageDownload: Line;

  // public chartData: ChartData<'line'>;
  // public chartOptions: ChartOptions<'line'>;

  public chartStorageUse: Chart;
  public chartNumberObject: Chart;
  public chartStorageUpload: Chart;
  public chartStorageDownload: Chart;

  constructor(private cdr: ChangeDetectorRef,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    // Đăng ký các thành phần của Chart.js
    // Chart.register(...registerables);
  }

  bytesConvert(bytes: number, label: boolean): string {
    if (bytes === 0) return '0';
    const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    const exponent = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = Math.round(bytes / Math.pow(1024, exponent));
    if (label) return `${value} ${units[exponent]}`;
    return value.toString();
  }

  private removeDuplicates(data: { timeSpan: number; value: number }[]): { [key: string]: string } {
    if(data === null){
      return null
    }else{
      return data.reduce((acc, item) => {
        const timeKey = this.transform(item.timeSpan);
        if (!(timeKey in acc) || item.value > parseFloat(acc[timeKey])) {
          acc[timeKey] = this.bytesConvert(item.value, true);
        }
        return acc;
      }, {} as { [key: string]: string });
    }
  }

  private removeDuplicatesTootip(data: { timeSpan: number; value: number }[]): { [key: string]: string } {
    if(data === null){
      return null
    }else{
      return data.reduce((acc, item) => {
        const timeKey = this.transformTooltip(item.timeSpan);
        if (!(timeKey in acc) || item.value > parseFloat(acc[timeKey])) {
          acc[timeKey] = this.bytesConvert(item.value, true);
        }
        return acc;
      }, {} as { [key: string]: string });
    }
  }
  

  private removeDuplicatesNumberObject(data: { timeSpan: number, value: number }[]): { [key: string]: number } {
    return data.reduce((acc, item) => {
      const timeKey = this.transformTooltip(item.timeSpan);
      if (!(timeKey in acc) || item.value > acc[timeKey]) {
        acc[timeKey] = Number(item.value);
      }
      return acc;
    }, {} as { [key: string]: number });
  }

  createChartStorageUse() {
    const data = this.summary[0]?.datas?.map((item) => ({
      timeSpan: item.timeSpan,
      value: parseInt(item.value, 10)
    })) || [];
    console.log('rawData:', data);
    const uniqueData = this.removeDuplicatesTootip(data);
    const labels = Object.keys(uniqueData);
    const dataValues = Object.values(uniqueData).map(value => parseFloat(value));
    
    this.chartStorageUse = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: data.length === 0 ? [] : labels,
        title: {
          text: ''
        },
        labels: {
          formatter: function() {
            return `${this.value.toString().split(' ')[1] === undefined ? this.value.toString() : this.value.toString().split(' ')[1]}`;
          }
        }
      },
      yAxis: {
        title: {
          text: 'Dung lượng sử dụng'
        }
      },
      tooltip: {
        formatter: function() {
          return `<b>${this.x}</b><br/>${this.series.name}: ${uniqueData[labels[this.point.index]]}`;
        }
      },
      series: [{
        name: this.i18n.fanyi('app.storage.usage'),
        data: data.length === 0 ? [] : dataValues
      } as any],
    });

  }

  createNumberObject() {
    const data = this.summary[1]?.datas?.map((item) => ({
      timeSpan: item.timeSpan,
      value: parseInt(item.value, 10)
    })) || [];
    const uniqueData = this.removeDuplicatesNumberObject(data);
    const labels = Object.keys(uniqueData);

    const dataValues = Object.values(uniqueData).map(value => value);
    
    this.chartNumberObject = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: data.length === 0 ? [] : labels,
        title: {
          text: ''
        },
        labels: {
          formatter: function() {
            return `${this.value.toString().split(' ')[1] === undefined ? this.value.toString() : this.value.toString().split(' ')[1]}`;
          }
        }
      },
      yAxis: {
        title: {
          text: this.i18n.fanyi('app.number.object')
        }
      },
      tooltip: {
        formatter: function() {
          return `<b>${this.x}</b><br/>${this.series.name}: ${uniqueData[labels[this.point.index]]}`;
        }
      },
      series: [{
        name: this.i18n.fanyi('app.number.object'),
        data: data.length === 0 ? [] : dataValues 
      } as any]
    });

  }

  createStorageUpload() {
    const data = this.summary[2]?.datas?.map((item) => ({
      timeSpan: item.timeSpan,
      value: parseInt(item.value, 10)
    })) || [];
    console.log('rawData:', data);

    const uniqueData = this.removeDuplicates(data);
    // Chuyển đổi timestamp thành định dạng thời gian đọc được
    const labels = Object.keys(uniqueData);

    const dataValues = Object.values(uniqueData).map(value => parseFloat(value));

    // Cấu hình Highcharts
    this.chartStorageUpload = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: data.length === 0 ? [] : labels,
        title: {
          text: ''
        },
        labels: {
          formatter: function() {
            return `${this.value.toString().split(' ')[1] === undefined ? this.value.toString() : this.value.toString().split(' ')[1]}`;
          }
        }
      },
      yAxis: {
        title: {
          text: this.i18n.fanyi('app.upload.capacity')
        }
      },
      tooltip: {
        formatter: function() {
          return `<b>${this.x}</b><br/>${this.series.name}: ${uniqueData[this.x]}`;
        }
      },
      series: [{
        name: this.i18n.fanyi('app.upload.capacity'),
        data: data.length === 0 ? [] : dataValues
      } as any],
    });
  }

  createStorageDownload() {
    const data = this.summary[3]?.datas?.map((item) => ({
      timeSpan: item.timeSpan,
      value: parseInt(item.value, 10)
    })) || [];
    const uniqueData = this.removeDuplicates(data);
    const labels = Object.keys(uniqueData);
    const dataValues = Object.values(uniqueData).map(value => parseFloat(value));
    
    // Cấu hình Highcharts
    this.chartStorageDownload = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: data.length === 0 ? [] : labels,
        title: {
          text: ''
        },
        labels: {
          formatter: function() {
            return `${this.value.toString().split(' ')[1] === undefined ? this.value.toString() : this.value.toString().split(' ')[1]}`;
          }
        }
      },
      yAxis: {
        title: {
          text: this.i18n.fanyi('app.upload.download')
        }
      },
      tooltip: {
        formatter: function() {
          return `<b>${this.x}</b><br/>${this.series.name}: ${uniqueData[this.x]}`;
        }
      },
      series: [{
        name: this.i18n.fanyi('app.upload.download'),
        data: data.length === 0 ? [] : dataValues
      } as any],
    });
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
            this.download(canvas.toDataURL('image/png'), 'png', 'storage-use');
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.storageUse.nativeElement).then((canvas) => {
            this.download(canvas.toDataURL('image/jpeg'), 'jpg', 'storage-use');
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
              'png',
              'number-object'
            );
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.numberObject.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/jpeg'),
              'jpg',
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
              'png',
              'storage-upload'
            );
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.storageUpload.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/jpeg'),
              'jpg',
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
              'png',
              'storage-download'
            );
          });
        }
        if (extension.includes('jpg')) {
          html2canvas(this.storageDownload.nativeElement).then((canvas) => {
            this.download(
              canvas.toDataURL('image/jpeg'),
              'jpg',
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
    link.download = `${type}.${extension}`;
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
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  getFormattedEndDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }
  transform(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    let minutesHour = Math.floor(date.getMinutes() / 10) * 10; 
    let minutesStr = String(minutesHour).padStart(2, '0');
    let minutes15 = Math.floor(date.getMinutes() / 3) * 3; 
    let minutes15Str = String(minutes15).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    let returnLabel = '';
    switch (this.timeSelected) {
      case 5:
        returnLabel = `${hours}:${minutes}`;
        break;
      case 15:
        returnLabel = `${hours}:${minutes15Str}`;
        break;
      case 60:
        returnLabel = `${hours}:${minutesStr}`;
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
        returnLabel = `${hours}:${minutes}:${seconds}`;
    }

    return returnLabel;
  }

  transformTooltip(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    let minutesHour = Math.floor(date.getMinutes() / 10) * 10; 
    let minutesStr = String(minutesHour).padStart(2, '0');
    let minutes15 = Math.floor(date.getMinutes() / 3) * 3; 
    let minutes15Str = String(minutes15).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    let returnLabel = `${day}/${month}/${year} ${hours}:${minutes}`;
    switch (this.timeSelected) {
      case 5:
        returnLabel = `${day}/${month}/${year} ${hours}:${minutes}`;
        break;
      case 15:
        returnLabel = `${day}/${month}/${year} ${hours}:${minutes15Str}`;
        break;
      case 60:
        returnLabel = `${day}/${month}/${year} ${hours}:${minutesStr}`;
        break;
      case 1440:
        returnLabel = `${day}/${month}/${year} ${hours}:00`;
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
        returnLabel = `${hours}:${minutes}:${seconds}`;
    }

    return returnLabel;
  }


  ngAfterViewInit(): void {
    // this.createChartStorageUse();
    this.createChartStorageUse();
    this.createNumberObject();
    this.createStorageUpload();
    this.createStorageDownload();
  }
}
