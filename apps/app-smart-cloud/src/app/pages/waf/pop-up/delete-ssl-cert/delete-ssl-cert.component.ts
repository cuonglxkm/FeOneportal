import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-delete-ssl-cert',
  templateUrl: './delete-ssl-cert.component.html',
  styleUrls: ['./delete-ssl-cert.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteSslCertComponent {
  @Input() sslCertData: any
  @Input() isVisible: boolean 
  @Output() onCancelVisible = new EventEmitter()

  isLoading: boolean = false;
  inputConfirm: string = ''
  checkInputEmpty: boolean = false;
  checkInputConfirm: boolean = false;


  constructor(private cdr: ChangeDetectorRef){}

  onInputChange(value: string){
    this.inputConfirm = value
  }

  handleCancel(){
    this.inputConfirm = '';
    this.checkInputConfirm = false;
    this.checkInputEmpty = false;
    this.onCancelVisible.emit()
  }

  handleOk(){
    if (this.inputConfirm == this.sslCertData.name) {
      console.log('successfully')
    } else if (this.inputConfirm == '') {
      this.checkInputEmpty = true;
      this.checkInputConfirm = false;
    } else {
      this.checkInputEmpty = false;
      this.checkInputConfirm = true;
    }
    this.cdr.detectChanges();
  }
}
