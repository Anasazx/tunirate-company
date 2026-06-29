import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySettingsManagementComponent } from './company-settings-management.component';

describe('CompanySettingsManagementComponent', () => {
  let component: CompanySettingsManagementComponent;
  let fixture: ComponentFixture<CompanySettingsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanySettingsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanySettingsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
