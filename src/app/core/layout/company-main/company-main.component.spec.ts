import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyMainComponent } from './company-main.component';

describe('CompanyMainComponent', () => {
  let component: CompanyMainComponent;
  let fixture: ComponentFixture<CompanyMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
