export interface KafkaCredential {
  serviceOrderCode: string;
  username: string;
  createdDate: string;
  updatedDate: string;
  createdUser: string;
  createdName: string;
  updatedUser: string;
  updatedName: string;
}

export class CreateKafkaCredentialData {
  constructor(
    private serviceOrderCode: string,
    private username: string,
    private password: string,
    private retypePassword: string,
  ) {
    this.serviceOrderCode = serviceOrderCode;
    this.username = username;
    this.password = password;
    this.retypePassword = retypePassword;
  }
}

export class ChangePasswordKafkaCredential {
  constructor(
    private serviceOrderCode: string,
    private username: string,
    private oldPassword: string,
    private newPassword: string,
    private retypePassword: string
  ) {
    this.serviceOrderCode = serviceOrderCode;
    this.username = username;
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
    this.retypePassword = retypePassword;
  }
}

export class NewPasswordKafkaCredential {
  constructor(
    private serviceOrderCode: string,
    private username: string,
    private newPassword: string,
    private retypePassword: string
  ) {
    this.serviceOrderCode = serviceOrderCode;
    this.username = username;
    this.newPassword = newPassword;
    this.retypePassword = retypePassword;
  }
}
