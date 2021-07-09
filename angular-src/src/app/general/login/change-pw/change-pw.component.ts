import { Component, OnInit } from '@angular/core';
import {ValidateService} from "../../../services/validate.service";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FlashMessagesService} from "angular2-flash-messages";

@Component({
  selector: 'app-change-pw',
  templateUrl: './change-pw.component.html',
  styleUrls: ['./change-pw.component.css']
})
export class ChangePwComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute,
              private flashMessage: FlashMessagesService, private validateService: ValidateService) { }
  email: string;
  ngOnInit() {
  }

  changePassword(form) {
    this.email = form.value.email;

    if (!this.validateService.validateLogin(this.email)) {
      this.flashMessage.show('Please insert the username', {
        cssClass: 'alert-danger',
        timeout: 1000
      });
      return false;
    }

    const formData: FormData = new FormData();
    formData.append('email', this.email);

    this.authService.changePassword(formData).subscribe( response => {

      if (response.succeeded) {
        //this.authService.storeData(response.response_data.user, response.response_data.token);
        this.flashMessage.show(response.message, {cssClass: 'alert-info', timeout: 3000});
        this.router.navigate(['/', 'login']);

      } else {
        this.flashMessage.show(response.message, {cssClass: 'alert-danger', timeout: 1000});
      }
    });
  }
}
