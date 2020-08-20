import { Component, OnInit } from '@angular/core';
import { ValidateService} from '../../services/validate.service';
import { QualichainService} from '../../services/qualichain.service';
import { HttpResponse, HttpEventType } from '@angular/common/http';
import {FlashMessagesService} from 'angular2-flash-messages';

@Component({
  selector: 'app-recruiting',
  templateUrl: './recruiting.component.html',
  styleUrls: ['./recruiting.component.css']
})
export class RecruitingComponent implements OnInit {
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

  constructor(private qualichainService: QualichainService,
              private flashMessage: FlashMessagesService,
              private validateService: ValidateService) { }

  ngOnInit() {

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
          this.flashMessage.show('Please insert a valid DID (see examples)', {cssClass: 'alert-danger', timeout: 3000});
          return false;
      }

      if (!this.validateService.validateCivilID(data.civilId,))  {
          this.flashMessage.show('Please insert a valid Civil ID (integer)', {cssClass: 'alert-danger', timeout: 3000});
          return false;
      }

      if (!this.validateService.validateCertificate(this.uploaded,this.fileToUpload))  {
          this.flashMessage.show('Please insert a valid certificate (.pdf)', {cssClass: 'alert-danger', timeout: 5000});
          return false;
      }
      const formData: FormData = new FormData();
      formData.append('certificate', (<HTMLInputElement>document.getElementById('myCertificate')).files[0]);
      formData.append('did', data.did);
      formData.append('civilId', data.civilId);
      console.log("DATA:");
      console.log(data);
      console.log("FORM DATA:");
      console.log(formData);
      this.qualichainService.validateCertificate(formData).subscribe(data => {
          this.status = 'Done'
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
        }

      }, error => {
        this.status = 'Error';
        //document.getElementById('responseBox').removeClass("alert alert-primary");
        this.response = error;
        console.log(error);
      });
  }

}
