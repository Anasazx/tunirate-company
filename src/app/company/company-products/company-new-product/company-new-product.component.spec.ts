import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyNewProductComponent } from './company-new-product.component';

describe('CompanyNewProductComponent', () => {
  let component: CompanyNewProductComponent;
  let fixture: ComponentFixture<CompanyNewProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyNewProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyNewProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
