import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsortiumAuthComponent } from './consortiumAuth.component';

describe('ConsortiumAuthComponent', () => {
  let component: ConsortiumAuthComponent;
  let fixture: ComponentFixture<ConsortiumAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsortiumAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsortiumAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
