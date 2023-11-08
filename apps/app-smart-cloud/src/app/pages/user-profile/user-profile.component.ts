import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.less']
})
export class UserProfileComponent implements OnInit {


  constructor(private http: HttpClient) {

  }


  ngOnInit(): void {

    this.http.get("https://reqres.in/api/users?page=1").subscribe(data => {
      console.log(data)
    })

  }


}
