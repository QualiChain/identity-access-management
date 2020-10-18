import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import {IamService} from '../../services/iam.service';

@Component({
    selector: 'app-student-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    user: any;
    TYPE: string;
    company: any;
    student: any;
    authToken: any;
    roles: string[];
    error: boolean;
    response: string;
    errorBox: string;

    constructor(private authService: AuthService,
                private flashMessage: FlashMessagesService,
                private IamService: IamService
    ) {}


    ngOnInit() {
        this.loadUser();
    }

    loadUser() {
        this.user = this.authService.loadUserProfile();
        this.roles = this.authService.getCurrentUserRole();
        this.authToken = this.authService.retrieveTokenUser();

    }
    iAmStudent()    {
        this.IamService.iAmStudent().subscribe(data => {
            console.log(data);
            if (data.succeeded) {
                this.error = false;
                this.response = data.message;
                document.getElementById('responseBoxError').innerHTML = '';
            }   else {
                this.error = true;
                this.response = data.message;
                this.errorBox = data.error;
                document.getElementById('responseBoxError').innerText = data.error
            }

        }, error => {
            //document.getElementById('responseBox').removeClass("alert alert-primary");

            document.getElementById('responseBoxError').innerText = error;
            console.log(error);
        });


    }
    iAmProfessor()    {
        this.IamService.iAmProfessor().subscribe(data => {
            console.log(data);
            if (data.succeeded) {
                this.error = false;
                this.response = data.message;
                document.getElementById('responseBoxError').innerHTML = '';
            }   else {
                this.error = true;
                this.response = data.message;
                this.errorBox = data.error;
                document.getElementById('responseBoxError').innerText = data.error
            }

        }, error => {
            //document.getElementById('responseBox').removeClass("alert alert-primary");
            document.getElementById('responseBoxError').innerText = error;

            console.log(error);
        });


    }
    iAmRecruiter()    {
        this.IamService.iAmRecruiter().subscribe(data => {
            console.log(data);
            if (data.succeeded) {
                this.error = false;
                this.response = data.message;
                document.getElementById('responseBoxError').innerHTML = '';
            }   else {
                this.error = true;
                this.response = data.message;
                this.errorBox = data.error;
                document.getElementById('responseBoxError').innerText = data.error
            }

        }, error => {
            //document.getElementById('responseBox').removeClass("alert alert-primary");
            document.getElementById('responseBoxError').innerText = error;
            console.log(error);
        });


    }

    iAmAcademic()    {
        this.IamService.iAmAcademic().subscribe(data => {
            console.log(data);
            if (data.succeeded) {
                this.error = false;
                this.response = data.message;
                document.getElementById('responseBoxError').innerHTML = '';
            }   else {
                this.error = true;
                this.response = data.message;
                this.errorBox = data.error;
                document.getElementById('responseBoxError').innerText = data.error
            }

        }, error => {
            //document.getElementById('responseBox').removeClass("alert alert-primary");
            document.getElementById('responseBoxError').innerText = error;
            console.log(error);
        });


    }

}
