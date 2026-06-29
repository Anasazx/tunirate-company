import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyMemberResponse } from '../../core/model/dto/companyMemberDTO/CompanyMemberResponse.model';
import { CompanyRole } from '../../core/model/enums/companyRole.enum.model';
import { CompanyMemberService } from '../../core/services/companyMemberService/company-member.service';
import { CompanyInvitationService } from '../../core/services/companyInvitationService/company-invitation.service';


@Component({
  selector: 'app-company-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-team-management.component.html',
  styleUrl: './company-team-management.component.css'
})
export class CompanyTeamManagementComponent implements OnInit {

  team: CompanyMemberResponse[] = [];

  roles = Object.values(CompanyRole);

  selectedRoleFilter: CompanyRole | null = null;

  loading = false;

  protected readonly companyRole = CompanyRole;

  companyId: number | null = null;

  constructor(
    private companyMemberService: CompanyMemberService,
    private companyInvitationService: CompanyInvitationService
  ) {}

  ngOnInit(): void {
    // TODO: replace with real source (route or shared service)
    this.companyId = 1;

    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;

    this.companyMemberService.getMyCompanyMembers().subscribe({
      next: (members) => {
        this.team = members;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get filteredTeam(): CompanyMemberResponse[] {
    if (!this.selectedRoleFilter) return this.team;

    return this.team.filter(
      member => member.companyRole === this.selectedRoleFilter
    );
  }

  setFilter(role: CompanyRole | null): void {
    this.selectedRoleFilter = role;
  }

  // ---------------- INVITE ----------------

  showInviteModal = false;
  inviteEmail = '';
  inviteRole: CompanyRole = CompanyRole.WORKER;

  openInviteModal() {
    this.showInviteModal = true;
    this.inviteEmail = '';
    this.inviteRole = CompanyRole.WORKER;
  }

  closeInviteModal() {
    this.showInviteModal = false;
  }

  inviteMember() {
    if (!this.inviteEmail.trim()) return;
    this.companyInvitationService.sendInvitation({
      invitedUserEmail: this.inviteEmail
    }).subscribe({
      next: () => {
        this.loadMembers();
        this.closeInviteModal();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }





  showRemoveModal = false;
  selectedMember: any = null;

  openRemoveModal(member: any): void {
    this.selectedMember = member;
    this.showRemoveModal = true;
  }

  closeRemoveModal(): void {
    this.selectedMember = null;
    this.showRemoveModal = false;
  }

  confirmRemove(): void {

    if (!this.selectedMember) return;

    this.companyMemberService
      .removeMemberFromMyCompany(this.selectedMember.user.id)
      .subscribe({
        next: () => {
          this.closeRemoveModal();
          this.loadMembers();
        },
        error: err => console.error(err)
      });
  }





}