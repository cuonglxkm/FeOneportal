import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'one-portal-disassociate-ssl-domain',
  templateUrl: './disassociate-ssl-domain.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisassociateSslDomainComponent {
  @Input() sslCertData: any
  @Input() domainData: any
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

  }
}
