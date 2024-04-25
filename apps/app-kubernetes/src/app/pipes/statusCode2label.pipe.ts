import { Pipe, PipeTransform } from '@angular/core';
import { StatusModel } from '../model/status.model';

@Pipe({
  name: 'statusCode2Label'
})
export class StatusCode2LabelPipe implements PipeTransform {

  transform(status: string): StatusModel {
    switch(status) {
      case 'ACTIVE':
        return new StatusModel("#0066b0", "Đang chạy");
      case 'STOPPED':
        return new StatusModel("#EA3829", "Đã dừng");
      case 'REBOOT':
        return new StatusModel("#FFBB63", "Khởi động lại");

      default:
        return new StatusModel("#4c4f67", "Không xác định");
    }

  }

}