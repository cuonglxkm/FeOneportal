import { Pipe, PipeTransform } from '@angular/core';
import { StatusModel } from '../core/models/status.model';
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
      case 6: 
        return new StatusModel("#ff9900", "Đang nâng cấp");
      case 7: 
        return new StatusModel("#cc6600", "Đang xóa");
      case 8: 
        return new StatusModel("#ff0000", "Khởi tạo lỗi");
      default:
        return new StatusModel("#4c4f67", "Không xác định");
    }

  }

}
