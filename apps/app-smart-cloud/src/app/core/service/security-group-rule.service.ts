import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {SecurityGroupSearchCondition} from "../model/interface/security-group";

const API_URL: string = 'http://172.16.68.200:1009';
@Injectable({
    providedIn: 'root'
})

export class SecurityGroupRuleService {
    constructor(public http: HttpClient) {}

    private getHeaders() {
        const token: string = '123456789'
        return new HttpHeaders({
            token,
            'Content-Type': 'application/json'
        })
    }

    create() {

    }

    delete(id: string, condition: SecurityGroupSearchCondition) {
        return this.http.delete(`${API_URL}/security_group/rule`, {
            headers: this.getHeaders(),
            body: JSON.stringify({id, ...condition})
        })
    }
}
