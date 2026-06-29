import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyReviewsManagementComponent } from './company-reviews-management.component';

describe('CompanyReviewsManagementComponent', () => {
  let component: CompanyReviewsManagementComponent;
  let fixture: ComponentFixture<CompanyReviewsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyReviewsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyReviewsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
