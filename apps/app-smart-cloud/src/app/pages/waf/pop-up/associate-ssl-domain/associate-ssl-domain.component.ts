import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-associate-ssl-domain',
  templateUrl: './associate-ssl-domain.component.html',
  styleUrls: ['./associate-ssl-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssociateSslDomainComponent {
  @Input() sslCertData: any
  @Input() isVisible: boolean 
  @Output() onCancelVisible = new EventEmitter()

  // isVisible: boolean = false;
  isLoading: boolean = false;
  inputConfirm: string = ''
  checkInputEmpty: boolean = false;
  checkInputConfirm: boolean = false;


  constructor(private cdr: ChangeDetectorRef){}

  openModal(){
    this.isVisible = true
  }

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
