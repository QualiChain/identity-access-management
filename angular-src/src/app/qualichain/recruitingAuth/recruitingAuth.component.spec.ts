import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitingAuthComponent } from './recruitingAuth.component';

describe('RecruitingAuthComponent', () => {
  let component: RecruitingAuthComponent;
  let fixture: ComponentFixture<RecruitingAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecruitingAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecruitingAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
