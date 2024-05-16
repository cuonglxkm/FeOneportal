import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'action2label'
})
export class Action2Label implements PipeTransform {

  transform(action: string): string {
    switch(action) {
      case 'UPDATE_REQUEST':
        return 'Yêu cầu nâng cấp';
      case 'UPDATE':
      case 'UPDATE_ERROR':
        return 'Cập nhật nâng cấp';
      case 'CREATION_REQUEST':
        return 'Yêu cầu khởi tạo';
      case 'CREATE':
      case 'CREATE_ERROR':
        return 'Cập nhật khởi tạo';
      case 'DELETION_REQUEST':
        return 'Yêu cầu xóa';
      case 'DELETE':
      case 'DELETE_ERROR':
        return 'Cập nhật xóa';
      case 'CREATE_INBOUND':
        return 'Tạo mới Rule Inbound';
      case 'CREATE_OUTBOUND':
        return 'Tạo mới Rule Outbound';
      case 'DELETE_INBOUND':
        return 'Xóa Rule Inbound';
      case 'DELETE_OUTBOUND':
        return 'Xóa Rule Outbound';

      default:
        return 'Không xác định';
    }

  }

}
