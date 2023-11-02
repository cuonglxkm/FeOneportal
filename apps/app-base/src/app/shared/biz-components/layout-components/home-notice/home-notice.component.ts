import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home-notice',
  templateUrl: './home-notice.component.html',
  styleUrls: ['./home-notice.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeNoticeComponent implements OnInit {
  noticeList = [
    { id: 1, type: 1, title: 'Take action on your Google Analytics account before July 1, 2023', time: '1 day ago', read: false },
    { id: 2, type: 2, title: 'Limited Offer! Membership Pass At Never Before Value', time: '1 day ago', read: false },
    { id: 3, type: 1, title: "Google passkeys are a no-brainer. You've turned them on, right?", time: '2 days ago', read: true },
    { id: 4, type: 3, title: "AWS Summit Online ASEAN is back - You've invited!", time: '1 week ago', read: false },
    { id: 5, type: 1, title: 'Thank you for taking Learn Google Sketup course from Eduonix', time: '1 week ago', read: false },
  ];
  messageList = [
    {
      id: 1, avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAKlBMVEVHcEz/Zmb/Zmb/Zmb/Zmb/Zmb/Zmb/Zmb/Zmb/Zmb/Zmb/Zmb/Zmb/ZmY/CWUAAAAADnRSTlMAwv87CCbSjOictH0VYFlsbtsAAAClSURBVHgBY0AAIQMQSUCAJYCBgTVJCQwKGJIMGDhUGRiclCBAE6iGpamBgaGoAKyeRSlKqZ1bA8haZAA1AahKZQOygPqBMCUGZAGgbBOKCiBtJFK9F0UgKFVJEY8KoP4kVFsc4LYg3HEBWeCWUjunFpq1rEoLkAWAvg3SQRYAqmEOQBMAAlQtDGiGUlWg6ACGAB4tiHhxANPIMQcFPEJgvsYGKB8AQc43nf9aouMAAAAASUVORK5CYII=',
      title: 'Mobirise', desc: 'Dark template with glass menu for IT startups', time: '1 week ago', read: false
    },
    {
      id: 2, avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAn1BMVEX///9UVVXOzs76+fj///9OT09YWVn///////////9GR0fl5eXY2NhlZWWOj492dnbv7+8Apd+wsbH68PacnZ2BgoL22+RcXV38sgTuLjrFxcVsbGylpaXW8O//890ArEvq+/66urqYJ47sDhn2nqH9zmuM0u79w0e76NCz5cmhQ5kMs16yaqxVyo2u4/W3t7fwWGD5v8LBiby/hLo6teTBkBgWAAAACnRSTlOB////////BoUK1Vyp2QAAAS9JREFUOI2l02dzgzAMBmCELaU1NnuTQEZHZvf//2016TUk4ND2qk/Geqx7wYd1a/GRsibWzVhfi9HzR/EHwKSbCSFoKq8Al4AAiJCmzAAchbrteZU2qKIh8ICEK33fkR4SugMQImXP3RoXPeB7APHpVAKgekDqQ10yJyPhXIIFUtUl1/PQvgQhQpeLs8QEklFg6wwdcBT1QbtVnkAIA8BjIPV9B1IYgCMI1NfmQpE3BLwkfU0Qh0mGGE8HIVuhBxMgAKLvmgD34wp1ZTHjCQoD0EFkGcr2G9uVy0zAVL8Faco4q2vOZzPOo/ahXXQgLYo7fp8/1pvdbhPtt+/8IQjmZ+B1VbxEeZ7Xh6Y5pMvtcv4RBE9nICpWxwls3TTraL9860/411v8ICz9f4/2J5+MTByIPo+nrwAAAABJRU5ErkJggg==',
      title: 'Agonda Deals', desc: "Here's your mid-week coupon, but you have to use it soon!", time: '1 week ago', read: false
    },
    {
      id: 3, avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACF0lEQVR4AexVxbYUMRAtXDb4V+Cwwek3qcEdupPZscHdnQ9AlrjLij3u7u4unc7g7tZU0EzePO9m1feceHIrdqsgHxIkSBACVJIizRTHxQHH04HAR4Fgz8uWaA1npzWH5tKcUBoowTqS0bNEEEaaiPO+ix2gOASZ9FQl8KteEFPS3JPzn5zj9CJ2/lgKtiXI4MaAs9IlmqvX0PrH+TizHKeAiazHCmjgm2X4js9xQOi6VaCc0Gt9DwcS3x1rE9+Ul+oEGptoEnVcyZ3ADt/t59SFiPBisFNXCjxi2qD2xRCgMgQi3cccUIJlVcZpCBEj63ZsRPwPTVu+V9ADlMD1uadPj4KYEHAcbT3zat1503wb321bH2KC7M8aWH/tCkiBn4yOexAzyMZ9w95bUOaOOLv2HzZw3djAJ7C0+taSXaQIHacq2XhnKCHQf2BnrjzSLLbTewwtuW8FydlEq3M3AFSKI8ApjnssFYwBrXl99eaAdsuRK8BjMyxv+MZ3u9b/rU821xr8rjhbQJKsBRWE5iCuhXY8kDw169/1DG1djToPFZokUFE5X2VwoKR4kRXolCbpuVKwQXqt+sURWumA/pD5nMRJPSHOJDme+Hv1NlTv3rWVwGWmb4gscfZdCrZM2yiFz061+h0jXlXUsCIOMrxBc0JZsZfe6SHv0sTnqe4Bx74PPNavtElHOt/FpoXeOkGCHxtsAAA1SS4Ykl3jFgAAAABJRU5ErkJggg==',
      title: 'Oracle Events', desc: 'Data Quality Insights, AutoML & Graph Analytics Demo', time: '1 week ago', read: false
    },
  ];
  taskList = [
    { id: 1, type: 1, title: 'JIRA - 1974', desc: 'Phôí hợp tích hợp đa ngôn ngữ 2023-05-10', read: false },
    { id: 2, type: 2, title: 'JIRA - 1962', desc: 'Performance backend services 2023-05-10', read: false },
    { id: 3, type: 3, title: 'JIRA - 1959', desc: 'Unit test 2023-05-10', read: false },
    { id: 4, type: 4, title: 'JIRA - 1954', desc: 'Quản lý lịch sử 2023-05-10', read: false },
  ];
  constructor(private translate: TranslateService) { }

  ngOnInit(): void { }
}
