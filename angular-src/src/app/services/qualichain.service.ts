import { Injectable } from '@angular/core';
import { Http, Headers} from '@angular/http';
import { AuthService} from './auth.service';
import { map } from 'rxjs/operators';
import { Vars } from '../../../.env';

@Injectable({
  providedIn: 'root'
})
export class QualichainService {
  validateUrl = 'http://localhost:8080/qualichain/validateCertificate';
  registerUrl = 'http://localhost:8080/qualichain/registerCertificate';

  constructor(private http: Http, private authService: AuthService) { }

  validateCertificate(formData) {
      console.log('At Validate, Form Data:');
      console.log(formData.get('file'));
      console.log(formData.get('did'));
      console.log(formData.get('civilId'));
      console.log('Env Vars');
      console.log(Vars);
      const headers = new Headers();
      if (Vars.ENVIRONMENT === 'PRODUCTION')    {
          this.validateUrl = 'qualichain/validateCertificate';
      } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
          this.validateUrl = 'https://qualichain.herokuapp.com/qualichain/validateCertificate';
      }
      headers.append('Content-Type', 'application/json');

      // @ts-ignore
      return this.http.post(this.validateUrl, formData, { observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
  }

  registerCertificate(formData) {
      if (Vars.ENVIRONMENT === 'PRODUCTION')    {
          this.registerUrl = 'qualichain/registerCertificate';
      } else if (Vars.ENVIRONMENT === 'INTEGRATION')    {
          this.registerUrl = 'https://qualichain.herokuapp.com/qualichain/registerCertificate';
      }

      // @ts-ignore
      return this.http.post(this.registerUrl, formData, { observe: `events`,  reportProgress: true }).pipe(map(res => res.json()));
  }
}
