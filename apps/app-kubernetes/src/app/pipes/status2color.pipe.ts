import { Pipe, PipeTransform } from '@angular/core';
import { StatusModel } from '../model/status.model';

@Pipe({
  name: 'status2ColorPipe'
})
export class Status2ColorPipe implements PipeTransform {

  transform(status: number): StatusModel {
    switch(status) {
      case 0:
        return new StatusModel("#ea3829", "Chưa gia hạn");
      case 1:
        return new StatusModel("#0066b0", "Đang khởi tạo");
      case 2:
        return new StatusModel("#008d47", "Đang hoạt động");

      default:
        return new StatusModel("#4c4f67", "Không xác định");
    }

  }

}
