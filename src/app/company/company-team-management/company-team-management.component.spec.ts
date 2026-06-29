import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyTeamManagementComponent } from './company-team-management.component';

describe('CompanyTeamManagementComponent', () => {
  let component: CompanyTeamManagementComponent;
  let fixture: ComponentFixture<CompanyTeamManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyTeamManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyTeamManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
