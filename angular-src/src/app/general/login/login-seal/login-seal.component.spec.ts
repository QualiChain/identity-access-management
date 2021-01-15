import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSealComponent } from './login-seal.component';

describe('LoginSealComponent', () => {
  let component: LoginSealComponent;
  let fixture: ComponentFixture<LoginSealComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginSealComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
