import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { Router, ActivatedRoute, Params} from "@angular/router";
import {FlashMessagesService} from "angular2-flash-messages";
import {ValidateService} from "../../services/validate.service";
//import { secrets } from '../../../.env';
import {IamService} from '../../services/iam.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    username: string;
    password: string;
    studentPath: string;
    professorPath: string;
    caller: string;

    constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute,
                private flashMessage: FlashMessagesService, private validateService: ValidateService,
                private IamService: IamService
    ) {

        const clientId = "secrets.FENIX_CLIENT_ID";
        const redirectUri = "secrets.REDIRECT_URL";
        const redirectUriProf = "secrets.REDIRECT_URL_PROF";

        this.studentPath = 'https://fenix.tecnico.ulisboa.pt/oauth/userdialog?' +
            'client_id=' + clientId + '&redirect_uri=' + redirectUri;

        this.professorPath = redirectUriProf;
    }

    ngOnInit() {

    }

    onLoginSubmit(form) {
        this.username = form.value.username;
        this.password = form.value.password;


        if (!this.validateService.validateLogin(this.username)) {
            this.flashMessage.show('Please insert the username', {
                cssClass: 'alert-danger',
                timeout: 1000
            });
            return false;
        }

        if (!this.validateService.validateLogin(this.password)) {
            this.flashMessage.show('Please insert the password', {cssClass: 'alert-danger', timeout: 1000});
            return false;
        }
        const formData: FormData = new FormData();
        formData.append('username', this.username);
        formData.append('password', this.password);

        this.authService.authUser(formData).subscribe( response => {

        if (response.succeeded) {
            this.authService.storeData(response.response_data.user, response.response_data.token);
            this.flashMessage.show(response.message, {cssClass: 'alert-info', timeout: 3000});
        } else {
            this.flashMessage.show(response.message, {cssClass: 'alert-danger', timeout: 1000});
            this.router.navigate(['/', 'login']);
        }

        /*
        if(response.response_data.user.roles.some(e => e === 'recruiter')) {
            console.log("e rec")
          this.router.navigate(["dashboardCompany"]);
          return;
        } else if (response.response_data.user.roles.some(e => e === 'student')) {
          this.router.navigate(["dashboardStudent"]);
          return;
        } else if (response.response_data.user.roles.some(e => e === 'professor')) {
          this.router.navigate(["dashboardProfessor"]);
          return;
        }
        */

        this.router.navigate(['profile']);


      });
    }

}
