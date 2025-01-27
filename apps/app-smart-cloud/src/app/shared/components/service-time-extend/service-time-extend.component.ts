import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'one-portal-service-time-extend',
  templateUrl: './service-time-extend.component.html',
  styleUrls: ['./service-time-extend.component.less']
})
export class ServiceTimeExtendComponent implements OnInit {
  @Input() createDate: any;
  @Input() expiredDate: any;
  @Input() newExpiredDate: any;
  @Output() valueChanged = new EventEmitter();

  dataSubjectTime: Subject<any> = new Subject<any>();
  numberMonth: number = 1;

  // newExpiredDate: any;

  constructor(private cdr: ChangeDetectorRef) {
    // this.onChangeTime();
  }

  form = new FormGroup({
    time: new FormControl('', {
      validators: [Validators.required]
    })
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
      event.preventDefault();
      // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }

    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value + event.key);
    if (value < 1 && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault();
    }


    // Kiểm tra nếu nhập vượt quá 100
    const newValue = currentValue + key;
    if (Number(newValue) > 100) {
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  onInput(event: any) {
    if (event.target.value === '0') {
      this.numberMonth = 1;
      event.target.value = 1;
      this.dataSubjectTime.next(this.numberMonth);
    }
  }

  changeTime(value) {
    console.log('value', value);
    if (value == '') {
      this.numberMonth = undefined;
    } else if (value < 1) {
      this.numberMonth = 1;
    } else {
      this.numberMonth = value;
    }
    console.log('month', this.numberMonth);
    this.dataSubjectTime.next(this.numberMonth);
  }

  onChangeTime() {
    this.dataSubjectTime.pipe(debounceTime(500)).subscribe((res) => {
      console.log(res);
      this.valueChanged.emit(res);
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.onChangeTime();
  }

}
