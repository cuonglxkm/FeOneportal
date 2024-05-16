import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MongodbInfor } from '../../../model/mongodb-infor.model';

@Component({
  selector: 'one-portal-backup',
  templateUrl:    './backup.component.html',
  styleUrls: ['./backup.component.css']
})
export class BackupComponent implements OnInit {

  @Input() appDetail : string;

  constructor(private route: ActivatedRoute) { }

  Mongodb: MongodbInfor;


  ngOnInit(): void {
    console.log('test')
    // Base.showLoading();
    // this.route.params
    //   .pipe(
    //     filter(params => params.hasOwnProperty('id')),
    //     switchMap((params) =>
    //       this.replicasetService.getDataDetail(params.id).pipe(
    //         map((data: any) => {
    //           return { id: params.id, response: data };
    //         })
    //       )
    //     )
    //   )
    //   .subscribe(data => {
    //     this.service = data.response.data;
    //     Base.hideLoading();
    //   },
    //     (err) => {
    //       Base.hideLoading();
    //       console.log(
    //         'Không thấy được thông tin chi tiết của dịch vụ MongoDB',
    //         err
    //       )
    //     }
    //   );
  }

}
