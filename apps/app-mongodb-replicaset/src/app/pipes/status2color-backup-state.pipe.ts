import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status2color_backup'
})

export class Status2ColorBackupPipe implements PipeTransform {
  transform(state: string): string {
    let color: string;

    switch (state) {
      case 'Thành công':
        color = '#34c38f'
        break;
      case 'Thất bại':
        color = '#f14141';
        break;
      case 'Bỏ qua':
        color = '#454754';
        break;
      case 'Đã hủy':
        color = '#ada8a8';
        break;
      case 'Đang backup':
        color = '#2e7bd9';
        break;
      case 'Đang hủy':
        color = '#ff9980';
        break;
      case 'Hủy lỗi':
        color = '#facf7a';
        break;
      default:
        color = '';
        break;
    }

    return color;
  }
}