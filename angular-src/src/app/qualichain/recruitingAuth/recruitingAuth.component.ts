import { Component, OnInit } from '@angular/core';
import { ValidateService} from '../../services/validate.service';
import { QualichainAuthService} from '../../services/qualichainAuth.service';
import { HttpResponse, HttpEventType } from '@angular/common/http';
import {FlashMessagesService} from 'angular2-flash-messages';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-recruiting',
  templateUrl: './recruitingAuth.component.html',
  styleUrls: ['./recruitingAuth.component.css']
})
export class RecruitingAuthComponent implements OnInit {
  // Successful; Error; Not Successful
  validationStatus: string = '';
  fileToUpload: File = null;
  inputDID: string;
  inputCivilID: string;
  response: any = 'Response from the request goes here';
  responseBox: HTMLElement;
    isMultipleUploaded = false;
    isSingleUploaded = false;
    acceptedExtensions = "jpg, jpeg, bmp, png, wav, mp3, mp4";
    errorBox: any = 'Any errors from the request goes here'
    error: boolean = false;
    uploaded: boolean = false;
  //Validation Retrieved
  status: string = 'Awaiting validation...';
  user: any;
  authToken: any;
  roles: string[];

  constructor(private authService: AuthService,
              private qualichainAuthService: QualichainAuthService,
              private flashMessage: FlashMessagesService,
              private validateService: ValidateService) { }

  ngOnInit() {
      this.loadUser();
  }

  loadUser() {
    this.user = this.authService.loadUserProfile();
    this.roles = this.authService.getCurrentUserRole();
    this.authToken = this.authService.retrieveTokenUser();
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    this.uploaded = true;
  }

  validateCertificate(form: any) {

      let data = {
        certificate: (<HTMLInputElement>document.getElementById('myCertificate')).files[0],
        did:  form.value.inputDID,
        civilId: form.value.inputCivilID
      }


      if (!this.validateService.validateAddress(data.did))  {
          this.flashMessage.show('Please insert a valid address (see examples)', {cssClass: 'alert-danger', timeout: 3000});
          return false;
      }

      if (!this.validateService.validateCivilID(data.civilId,))  {
          this.flashMessage.show('Please insert a valid Civil ID (integer)', {cssClass: 'alert-danger', timeout: 3000});
          return false;
      }

      if (!this.validateService.validateCertificate(this.uploaded,this.fileToUpload))  {
          this.flashMessage.show('Please insert a valid certificate (.pdf)', {cssClass: 'alert-danger', timeout: 3000});
          return false;
      }
      const formData: FormData = new FormData();
      formData.append('certificate', (<HTMLInputElement>document.getElementById('myCertificate')).files[0]);
      formData.append('did', data.did);
      formData.append('civilId', data.civilId);

      this.qualichainAuthService.validateCertificate(formData).subscribe(data => {
          this.status = 'Done'
          console.log("IM HEREEEEEEEEE")
          console.log(data);
          if (data.succeeded) {
                this.error = false;
                this.validationStatus = 'Success'
                this.response = data.message + ' - Certificate hash is: ' + data.response_data;
                document.getElementById('responseBoxError').innerHTML = '';
        }   else {
                this.error = true;
                this.validationStatus = 'Error'
                this.response = data.message;
                this.errorBox = data.error;
                document.getElementById('responseBoxError').innerText = data.error
          }

      }, error => {
        this.status = 'Error';
        //document.getElementById('responseBox').removeClass("alert alert-primary");
        this.response = error;
        console.log(error);
      });
  }

}
