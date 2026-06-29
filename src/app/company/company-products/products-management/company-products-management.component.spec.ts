import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyProductsManagementComponent } from './company-products-management.component';

describe('CompanyProductsManagementComponent', () => {
  let component: CompanyProductsManagementComponent;
  let fixture: ComponentFixture<CompanyProductsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyProductsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyProductsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
