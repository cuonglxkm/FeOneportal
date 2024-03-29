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
        return 'Cập nhật nâng cấp';
      case 'CREATION_REQUEST':
        return 'Yêu cầu khởi tạo';
      case 'CREATE':
        return 'Cập nhật khởi tạo';
      case 'DELETE_REQUEST':
        return 'Yêu cầu xóa';
      case 'DELETE':
        return 'Cập nhật xóa';

      default:
        return 'Không xác định';
    }

  }

}
