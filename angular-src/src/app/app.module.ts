import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseRequestOptions, HttpModule } from '@angular/http';
import { NavbarComponent } from './general/navbar/navbar.component';
import { HomeComponent } from './general/home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { ValidateService } from './services/validate.service';
import { AuthService } from './services/auth.service';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { AuthGuardService } from './services/auth-guard.service';
import { FooterComponent } from './general/footer/footer.component';
import {MockBackend} from '@angular/http/testing';
import { AgmCoreModule } from '@agm/core';
import { PrivacyPolicyComponent } from './general/privacy-policy/privacy-policy.component';
import { Vars } from  '../../.env';
import { ChartsModule } from 'ng2-charts';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { RecruitingComponent } from './qualichain/recruiting/recruiting.component'

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'recruiting', component: RecruitingComponent},


    {path: 'privacy-policy', component: PrivacyPolicyComponent},

];

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        FooterComponent,
        PrivacyPolicyComponent,
        RecruitingComponent

    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbModule,
        ReactiveFormsModule,
        ChartsModule,
        JwtModule.forRoot({
            config: {
                whitelistedDomains: ['localhost:3001', 'localhost:8080', 'qualichain.herokuapp.com',
                                     'fenix.tecnico.ulisboa.pt/oauth, maps.googleapis.com']
            }
        }),
        RouterModule.forRoot(appRoutes),
        AgmCoreModule.forRoot({
            apiKey: Vars.GOOGLE_MAPS,
        }),
        FlashMessagesModule,
    ],
    providers: [
        ValidateService,
        AuthService,
        AuthGuardService,
        MockBackend,
        BaseRequestOptions,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
