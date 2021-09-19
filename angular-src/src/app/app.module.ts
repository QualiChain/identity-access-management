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
import { MockBackend } from '@angular/http/testing';
import { PrivacyPolicyComponent } from './general/privacy-policy/privacy-policy.component';
import { Vars } from '../../.env';
import { ChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RecruitingComponent } from './qualichain/recruiting/recruiting.component';
import { RecruitingAuthComponent } from './qualichain/recruitingAuth/recruitingAuth.component';
import { ConsortiumComponent } from './qualichain/consortium/consortium.component';
import { ConsortiumAuthComponent } from './qualichain/consortiumAuth/consortiumAuth.component';
import { RegisterComponent} from './general/register/register.component';
import { CompanyRegisterComponent } from './general/register/company-register/company-register.component';
import { LoginComponent } from './general/login/login.component';
import { ProfileComponent } from './general/profile/profile.component';
import { LoginStudentComponent } from './general/login/login-student/login-student.component';
import { LoginSealComponent } from './general/login/login-seal/login-seal.component';
import { ChangePwComponent } from './general/login/change-pw/change-pw.component';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'recruiting', component: RecruitingComponent},
    {path: 'recruitingAuth', component: RecruitingAuthComponent, canActivate: [AuthGuardService]},
    {path: 'consortium', component: ConsortiumComponent},
    {path: 'consortiumAuth', component: ConsortiumAuthComponent, canActivate: [AuthGuardService]},
    {path: 'register', children: [
            {path: '', component: RegisterComponent},
            {path: 'company', component: CompanyRegisterComponent}
        ]},
    {path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService]},

    /*
    {path: 'auth', children:    [
            {path: '.well-known', children: [
                    {path:'openid-configuration', redirectTo: 'http://web.ist.utl.pt/~ist180970/qualichain/.wellknown'}
                ]},
            {path: 'jwks', redirectTo: 'http://web.ist.utl.pt/~ist180970/qualichain/jwks'}
        ]},
    */

    {path: 'login', children: [
            {path: '', component: LoginComponent},
            {path: 'changePassword', component: ChangePwComponent},
            {path: 'callback/seal', component: LoginSealComponent}
        ]},

    {path: 'privacy-policy', component: PrivacyPolicyComponent},

];

@NgModule({
    declarations: [
        AppComponent,
        ProfileComponent,
        RegisterComponent,
        CompanyRegisterComponent,
        NavbarComponent,
        LoginComponent,
        HomeComponent,
        FooterComponent,
        PrivacyPolicyComponent,
        RecruitingComponent,
        RecruitingAuthComponent,
        ConsortiumComponent,
        ConsortiumAuthComponent,
        LoginStudentComponent,
        LoginSealComponent,
        ChangePwComponent

    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbModule,
        ReactiveFormsModule,
        ChartsModule,
        RouterModule.forRoot(appRoutes),
        FlashMessagesModule,
        JwtModule.forRoot({
            config: {
                whitelistedDomains: ['localhost:3001', 'localhost:8080', 'qualichain.herokuapp.com',
                                     'fenix.tecnico.ulisboa.pt/oauth', 'maps.googleapis.com',
                                    'dss1.aegean.gr/auth/realms/SSI/protocol/openid-connect/auth']
            }
        }),
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
