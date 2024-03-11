import { Component } from '@angular/core';

@Component({
  selector: 'one-portal-bucket-detail',
  templateUrl: './bucket-detail.component.html',
  styleUrls: ['./bucket-detail.component.less'],
})
export class BucketDetailComponent {
  listOfData: any;
  size = 10;
  index: number = 1;
  total: number = 0;
  loading = false;
  list
  isVisibleFilter = false;
  listOfFilter: any;
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '60%',
  };

  colReal = ['Tên','Thời gian chỉnh sửa','Dung lượng',]
  conditionNameReal = ['Bằng','Bao gốm','Bắt đầu','Kêt thức',]
  dataFilter = [
    {orderNum:'1',name:'Tên', condition:'Bằng', value:'sơn',type:'',},
    {orderNum:'2',name:'Tên', condition:'Bắt đầu', value:'',type:'',},
    {orderNum:'3',name:'Thời gian chỉnh sửa', condition:'Lớn hơn', value:'1',type:'',},
    {orderNum:'4',name:'Thời gian chỉnh sửa', condition:'Nhỏ hơn', value:'13',type:'',},
    {orderNum:'5',name:'Dung lượng', condition:'Lớn hơn', value:'1',type:'Bytes',},
  ]
  search(value: string) {

  }

  uploadFile() {

  }

  onPageSizeChange(event: any) {
    this.size = event
    // this.getData(false);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    // this.getData(false);
  }

  openFilter() {
    this.isVisibleFilter = true;
  }

  handleCancel() {
    this.isVisibleFilter = false;
  }
}
