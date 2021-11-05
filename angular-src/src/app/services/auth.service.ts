import { Injectable } from '@angular/core';
import { Http, Headers} from '@angular/http';
import { map } from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Vars} from '../../../.env';

@Injectable()
export class AuthService {
  authToken: any;
  user: any;
  register_url: string = 'http://localhost:8080/qualichain/users/register';
  login_url: string = 'http://localhost:8080/qualichain/users/login';


constructor(private http:Http, public jwtHelper: JwtHelperService) { }

  //Checks if user is logged in
    loggedIn() {
        const token = localStorage.getItem('authToken');
        return token != null && !this.jwtHelper.isTokenExpired(token);
    }

  logOut()  {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  loadUserProfile() {
    // Gets string from the localStorage and parses it into an obj
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
  }

  getCurrentUserRole() {
    this.user = this.loadUserProfile();
    if (this.user != null && this.user !== undefined) {
      return this.user.roles;
    } else {
      return null;
    }
  }

  getCurrentUserName() {
    this.user = this.loadUserProfile();
    if (this.user != null && this.user !== undefined) {
      return this.user.name;
    } else {
      return null;
    }
  }

  getCurrentUserEmail() {
    this.user = this.loadUserProfile();
    if (this.user != null && this.user !== undefined) {
      return this.user.email;
    } else {
      return null;
    }
  }

  getCurrentUserAddress() {
    this.user = this.loadUserProfile();
    if (this.user != null && this.user !== undefined) {
      if (this.user.email === 'ntua_academic@outlook.com' || this.user.email === 'asep_dissemination@outlook.com') {
        return 'NTUA';
      } else {
        return 'INESC-ID';
      }
    } else {
      return 'INESC-ID';
    }
  }

  changePassword(formData) {

    const headers = new Headers();
    if (Vars.ENVIRONMENT === 'PRODUCTION')    {
      this.login_url = "https://qualichain.herokuapp.com/users/changePassword";
    } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
      this.login_url = "https://qualichain.herokuapp.com/users/changePassword";
    } else if (Vars.ENVIRONMENT === 'TEST')    {
      this.login_url = "http://localhost:8080/users/changePassword";
    }

    headers.append('Content-Type', 'application/json');
    // @ts-ignore
    return this.http.post(this.login_url, formData, { observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
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


  storeData(user, token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadTokenUser(headers) {
    const token = localStorage.getItem('authToken');
    this.authToken = token;
    headers.append('Authorization', token);
  }

  retrieveTokenUser() {
    return localStorage.getItem('authToken');
  }


  loginSeal(code, state) {
    let url: string;
    if (Vars.ENVIRONMENT === 'PRODUCTION')    {
      url = "auth/login/seal";
    } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
      url = "https://qualichain.herokuapp.com/auth/login/seal";
    } else if (Vars.ENVIRONMENT === 'TEST')    {
      url = "http://localhost:8080/auth/login/seal";
    }
    const formData: FormData = new FormData();
    formData.append('code', code);
    formData.append('state', state);
    const headers = new Headers();
    // @ts-ignore
    return this.http.post(url, formData, { headers: headers, observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
  }

}
