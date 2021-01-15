import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { Router, ActivatedRoute, Params} from "@angular/router";
import {FlashMessagesService} from "angular2-flash-messages";
import {ValidateService} from "../../services/validate.service";
import {IamService} from '../../services/iam.service';
import { Vars } from '../../../../.env'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    @ViewChild('loginStudent') myId: ElementRef;
    @ViewChild('loginStudent2') myId2: ElementRef;
    @ViewChild('loginStudent3') myId3: ElementRef;

    username: string;
    password: string;
    studentPath: string;
    professorPath: string;
    sealPath: string;
    redirectUri: string;

    caller: string;
    toggled1: boolean;
    toggled2: boolean;
    toggled3: boolean;

    constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute,
                private flashMessage: FlashMessagesService, private validateService: ValidateService,
                private IamService: IamService
    ) {
        const clientId = Vars.SEAL_CLIENT_ID;

        if (Vars.ENVIRONMENT === 'PRODUCTION')    {
            this.redirectUri = Vars.SEAL_REDIRECT_URL;
        }   else if (Vars.ENVIRONMENT === 'TEST')   {
            this.redirectUri = Vars.SEAL_REDIRECT_URL_LOCAL;
        }
        console.log(this.redirectUri)
        const responseType = 'code';

        //SEAL-EIDAS-EDUGAIN, SEAL-EIDAS, SEAL-EIDAS-EDUGAIN
        //https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
        //https://ldapwiki.com/wiki/Openid-configuration

        //SEAL-EDUGAIN, SEAL-EIDAS,SEAL-EIDAS-EDUGAIN
        const scopes = 'SEAL-EDUGAIN';

        this.sealPath = 'https://dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/auth?' +
            'client_id=' + clientId + '&redirect_uri=' +
            this.redirectUri + '&response_type=' + responseType +
            '&scope=' + scopes;

        console.log("SEAL Path: " + this.sealPath);

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

    toggleAuth() {
        this.toggled1 = !this.toggled1;
        if (this.toggled1) {
            this.myId.nativeElement.attributes.class.nodeValue = "btn btn-primary btn-lg";
        } else {
            this.myId.nativeElement.attributes.class.nodeValue = "disabled btn btn-primary btn-lg";
        }
    }

    toggleAuth2() {
        this.toggled2 = !this.toggled2;
        if (this.toggled2) {
            this.myId2.nativeElement.attributes.class.nodeValue = "btn btn-primary btn-lg";
        } else {
            this.myId2.nativeElement.attributes.class.nodeValue = "disabled btn btn-primary btn-lg";
        }
    }

    toggleAuth3() {
        this.toggled3 = !this.toggled3;
        if (this.toggled3) {
            this.myId3.nativeElement.attributes.class.nodeValue = "btn btn-primary btn-lg";
        } else {
            this.myId3.nativeElement.attributes.class.nodeValue = "disabled btn btn-primary btn-lg";
        }
    }
}
