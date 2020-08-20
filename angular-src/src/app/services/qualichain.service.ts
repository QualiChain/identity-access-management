import { Injectable } from '@angular/core';
import { Http, Headers} from '@angular/http';
import { AuthService} from './auth.service';
import { map } from 'rxjs/operators';
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
export class QualichainService {
    url: string = 'qualichain/validateCertificate';
  constructor(private http:Http, private authService: AuthService) { }

  validateCertificate(formData) {
      console.log("At Validate, Form Data:");
      console.log(formData.get('file'))
      console.log(formData.get('did'))
      console.log(formData.get('civilId'))
    let headers = new Headers();
      headers.append('Content-Type', 'application/json');
    //optional
    //this.authService.loadTokenUser(headers);
    // @ts-ignore
      return this.http.post(this.url, formData, { observe: 'events',  reportProgress: true }).pipe(map(res => res.json()));
  }
  uploadCertificate(data) {
      console.log("at validate")
      console.log(data)
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    //optional
    this.authService.loadTokenUser(headers);
    return this.http.post('qualichain/validateCertificate', {data},
        {headers: headers}).pipe(map(res => res.json()));
  }

    /*

        public upload(
        files: Set<File>
    ): { [key: string]: { progress: Observable<number> } } {
        // this will be the our resulting map
        const status: { [key: string]: { progress: Observable<number> } } = {};

        files.forEach(file => {
            // create a new multipart-form for every file
            const formData: FormData = new FormData();
            formData.append('file', file, file.name);

            // create a http-post request and pass the form
            // tell it to report the upload progress
            const req = new HttpRequest('POST', this.url, formData, {
                reportProgress: true
            });

            // create a new progress-subject for every file
            const progress = new Subject<number>();

            // send the http-request and subscribe for progress-updates

            const startTime = new Date().getTime();
            this.http.request(req).subscribe(event => {
                if (event.type === HttpEventType.UploadProgress) {
                    // calculate the progress percentage

                    const percentDone = Math.round((100 * event.loaded) / event.total);
                    // pass the percentage into the progress-stream
                    progress.next(percentDone);
                } else if (event instanceof HttpResponse) {
                    // Close the progress-stream if we get an answer form the API
                    // The upload is complete
                    progress.complete();
                }
            });

            // Save every progress-observable in a map of all observables
            status[file.name] = {
                progress: progress.asObservable()
            };
        });

        // return the map of progress.observables
        return status;
    }
}
     */
}
