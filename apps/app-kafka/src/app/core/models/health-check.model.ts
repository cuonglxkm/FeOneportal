export class HealthCheckModel {
  health: any[];
  unHealth: any[];
  unCheck: any[];
  warning: any[];

  constructor() {
    //
  }
}

export class HealthStatusModel {
  status: number;
  message: string;
}