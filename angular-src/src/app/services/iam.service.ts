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
export class IamService {
    register_url: string = 'http://localhost:8080/users/register';
    login_url: string = 'http://localhost:8080/users/login';
    url: string = '';

  constructor(private http:Http, private authService: AuthService) { }


    registerCompany(formData) {
        const headers = new Headers();
        this.authService.loadTokenUser(headers);

        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.register_url = "users/register";
        } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
            this.register_url = "https://qualichain.herokuapp.com/users/register";
        } else if (Vars.ENVIRONMENT === 'TEST')  {
            this.register_url = "http://localhost:8080/users/register";
        }
        // @ts-ignore
        return this.http.post(this.register_url, formData, { headers: headers,observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
    }

    authUser(formData) {

        const headers = new Headers();
        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.login_url = "users/login";
        } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
            this.login_url = "https://qualichain.herokuapp.com/users/login";
        } else if (Vars.ENVIRONMENT === 'TEST')    {
            this.login_url = "http://localhost:8080/users/login";
        }

        headers.append('Content-Type', 'application/json');
        // @ts-ignore
        return this.http.post(this.login_url, formData, { observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
    }

    iAmStudent() {
        const headers = new Headers();
        this.authService.loadTokenUser(headers);

        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.url = "users/iAmStudent";
        } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
            this.url = "https://qualichain.herokuapp.com/users/iAmStudent";
        } else if (Vars.ENVIRONMENT === 'TEST')    {
            this.url = "http://localhost:8080/users/iAmStudent";
        }
        // @ts-ignore
        return this.http.post(this.url,'', { headers: headers, observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
    }
    iAmProfessor() {
        const headers = new Headers();
        this.authService.loadTokenUser(headers);

        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.url = "users/iAmProfessor";
        } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
            this.url = "https://qualichain.herokuapp.com/users/iAmProfessor";
        } else if (Vars.ENVIRONMENT === 'TEST')    {
            this.url = "http://localhost:8080/users/iAmProfessor";
        }

        // @ts-ignore
        return this.http.post(this.url,'', { headers: headers, observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
    }
    iAmRecruiter() {
        const headers = new Headers();
        this.authService.loadTokenUser(headers);

        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.url = "users/iAmRecruiter";
        } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
            this.url = "https://qualichain.herokuapp.com/users/iAmRecruiter";
        } else if (Vars.ENVIRONMENT === 'TEST')    {
            this.url = "http://localhost:8080/users/iAmRecruiter";
        }

        // @ts-ignore
        return this.http.post(this.url,'', { headers: headers, observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
    }
    iAmAcademic() {
        const headers = new Headers();
        this.authService.loadTokenUser(headers);

        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.url = "users/iAmAcademic";
        } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
            this.url = "https://qualichain.herokuapp.com/users/iAmAcademic";
        } else if (Vars.ENVIRONMENT === 'TEST')    {
            this.url = "http://localhost:8080/users/iAmAcademic";
        }

        // @ts-ignore
        return this.http.post(this.url,'', { headers: headers, observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
    }
}
