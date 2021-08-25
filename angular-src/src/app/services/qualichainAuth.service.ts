import { Injectable } from '@angular/core';
import { Http, Headers} from '@angular/http';
import { AuthService} from './auth.service';
import { map } from 'rxjs/operators';
import { Vars } from '../../../.env';

import { Subject, Observable, throwError } from 'rxjs';
import {
    HttpRequest,
    HttpEventType,
    HttpResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QualichainAuthService {
    validateUrl = 'http://localhost:8080/qualichain/validateCertificateAuth';
    registerUrl = 'http://localhost:8080/qualichain/registerCertificateAuth';

    constructor(private http: Http, private authService: AuthService) { }

    validateCertificate(formData) {
        console.log('At Validate, Form Data:');
        console.log(formData.get('file'));
        console.log(formData.get('did'));
        console.log(formData.get('civilId'));
        const headers = new Headers();
        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.validateUrl = 'qualichain/validateCertificateAuth';
        } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
            this.validateUrl = 'https://qualichain.herokuapp.com/qualichain/validateCertificateAuth';
        }
        // headers.append('Content-Type', 'application/json');

        this.authService.loadTokenUser(headers);

        // @ts-ignore
        return this.http.post(this.validateUrl, formData, { observe: 'events',  reportProgress: true, headers: headers }).pipe(map(res => res.json()));
    }

    registerCertificate(formData) {
        const headers = new Headers();
        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.registerUrl = 'qualichain/registerCertificateAuth';
        } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
            this.registerUrl = 'https://qualichain.herokuapp.com/qualichain/registerCertificateAuth';
        }

        // headers.append('Content-Type', 'application/json');

        this.authService.loadTokenUser(headers);

        // @ts-ignore
        return this.http.post(this.registerUrl, formData, { observe: `events`,  reportProgress: true, headers: headers }).pipe(map(res => res.json()));
    }
}
