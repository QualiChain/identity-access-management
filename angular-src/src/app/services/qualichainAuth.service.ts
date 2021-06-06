import { Injectable } from '@angular/core';
import { Http, Headers} from '@angular/http';
import { AuthService} from './auth.service';
import { map } from 'rxjs/operators';
import { Vars } from '../../../.env'

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
    url: string = 'http://localhost:8080/qualichain/validateCertificateAuth';
  constructor(private http: Http, private authService: AuthService) { }

  validateCertificate(formData) {
      console.log("At Validate, Form Data:");
      console.log(formData.get('file'))
      console.log(formData.get('did'))
      console.log(formData.get('civilId'))
      console.log("Env Vars")
      console.log(Vars)
      let headers = new Headers();
      if (Vars.ENVIRONMENT === 'PRODUCTION')    {
          this.url = "qualichain/validateCertificateAuth";
      } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
          this.url = "https://qualichain.herokuapp.com/qualichain/validateCertificateAuth";
      }
      headers.append('Content-Type', 'application/json');

    this.authService.loadTokenUser(headers);

    // @ts-ignore
      return this.http.post(this.url, formData, { observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
  }
}
