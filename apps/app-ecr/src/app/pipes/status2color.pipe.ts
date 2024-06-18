import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status2Color'
})
export class Status2ColorPipe implements PipeTransform {
  transform(status: number): { color: string, name: string } {
    switch(status) {
      case 1:
        return {
          color:"#0066B0",
          name: "app.status.init"
        };
      case 2:
        return {
          color:"#008D47",
          name: "app.status.running"
        };
      case 6:
        return {
          color:"#0066b0",
          name: "app.status.upgrade"
        };
      case 7:
        return {
          color:"#EA3829",
          name: "app.status.deleting"
        };
      case 8:
        return {
          color:"#EA3829",
          name: "app.status.init-failed"
        };
      case 10:
        return {
          color:"#FFBB63",
          name: "app.status.suspend"
        };
      case 11:
        return {
          color:"#513FE7",
          name: "app.status.restoring"
        };
      case 12:
        return {
          color:"#FCD717",
          name: "service.status.violation"
        };
      default:
        return null;
    }

  }

}
