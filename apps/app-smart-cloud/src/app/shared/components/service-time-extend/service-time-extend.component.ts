import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { addDays } from 'date-fns';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'one-portal-service-time-extend',
  templateUrl: './service-time-extend.component.html',
  styleUrls: ['./service-time-extend.component.less']
})
export class ServiceTimeExtendComponent implements OnInit {
  @Input() createDate: any;
  @Input() expiredDate: any;
  @Input() newExpiredDate: any
  @Output() valueChanged = new EventEmitter();

  dataSubjectTime: Subject<any> = new Subject<any>();
  numberMonth: number = 1;
  // newExpiredDate: any;

  constructor(private cdr: ChangeDetectorRef) {
  }

  form = new FormGroup({
    time: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  onKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const key = event.key;
    const currentValue = inputElement.value;
    
    // Cho phép các phím đặc biệt
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab'
    ];

    // Kiểm tra nếu phím không phải là số, không phải các phím đặc biệt, hoặc là số 0 ở đầu
    if (
      (!allowedKeys.includes(key) && isNaN(Number(key))) || 
      (key === '0' && currentValue.length === 0)
    ) {
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }

    // Kiểm tra nếu nhập vượt quá 100
    const newValue = currentValue + key;
    if (Number(newValue) > 100) {
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  changeTime(value) {
    this.dataSubjectTime.next(value);
  }

  onChangeTime() {
    this.dataSubjectTime.pipe(debounceTime(500))
      .subscribe((res) => {
        console.log(res);
        this.valueChanged.emit(res);
        // let expiredDate = new Date(this.expiredDate);
        // expiredDate.setDate(expiredDate.getDate() + this.numberMonth * 30);
        // this.newExpiredDate = expiredDate.toISOString().substring(0, 19);
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {
    // console.log(this.expiredDate);
    // console.log(this.createDate);
    //
    // let expiredDate = new Date(this.expiredDate);
    // expiredDate.setDate(expiredDate.getDate() + this.numberMonth * 30);
    //
    // this.newExpiredDate = expiredDate.toISOString().substring(0, 19);
    // console.log('new', this.newExpiredDate)
    this.onChangeTime();
  }

}
