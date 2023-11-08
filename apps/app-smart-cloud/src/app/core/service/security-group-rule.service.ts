import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {SecurityGroupRule} from "../model/interface/security-group-rule";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class SecurityGroupRuleService {
    constructor(public http: HttpClient) {
    }


}
