import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {FlashMessagesService} from 'angular2-flash-messages';

@Component({
  selector: 'app-login-seal',
  templateUrl: './login-seal.component.html',
  styleUrls: ['./login-seal.component.css']
})
export class LoginSealComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
              private router: Router, private flashMessage: FlashMessagesService) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      const token = params['code'];
      this.authService.loginSeal(token).subscribe( response => {
        if (response.succeeded){
          console.log(response);
          this.authService.storeData(response.response_data.user, response.response_data.token);
        } else {
          this.flashMessage.show(response.message, {cssClass: 'alert-danger', timeout: 5000});
          console.log(response);
        }
      });
    });
  }

}
