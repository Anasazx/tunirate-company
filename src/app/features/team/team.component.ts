import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyApiService } from '../../core/api/company-api.service';
import { CompanyContextService } from '../../core/api/company-context.service';
import { CompanyRole, Invitation, Membership } from '../../core/api/models';
import { BadgeComponent } from '../../core/ui/badge.component';
import { EmptyStateComponent } from '../../core/ui/empty-state.component';
import { ToastService } from '../../core/ui/toast.service';
import { ConfirmService } from '../../core/ui/confirm.service';
import { apiErrorMessage } from '../../core/ui/api-error';
import { initials, timeAgo } from '../../core/ui/format';
import { LoaderCircle, Mail, Send, Trash2, UserPlus, Users, X } from '../../core/ui/icons';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [DatePipe, FormsModule, LucideAngularModule, BadgeComponent, EmptyStateComponent],
  templateUrl: './team.component.html',
})
export class TeamComponent implements OnInit {
  private api = inject(CompanyApiService);
  private context = inject(CompanyContextService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  readonly members = signal<Membership[]>([]);
  readonly invitations = signal<Invitation[]>([]);
  readonly loading = signal(true);
  readonly busyId = signal<number | null>(null);

  inviteEmail = '';
  readonly inviting = signal(false);
  readonly inviteError = signal<string | null>(null);

  readonly meId = computed(() => this.context.membership()?.user.id);
  readonly pending = computed(() => this.invitations().filter(i => i.status === 'PENDING' && !i.expired));
  readonly roles: CompanyRole[] = ['HEAD', 'WORKER'];
  readonly roleLabels: Record<CompanyRole, string> = { HEAD: 'Head', WORKER: 'Member' };

  readonly initials = initials;
  readonly timeAgo = timeAgo;
  protected readonly icons = { UserPlus, Users, Trash2, Mail, Send, X, LoaderCircle };

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getTeam().subscribe({
      next: m => {
        this.members.set([...m].sort((a, b) => (a.companyRole === b.companyRole ? a.user.name.localeCompare(b.user.name) : a.companyRole === 'HEAD' ? -1 : 1)));
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not load your team.'));
      }
    });
    this.api.getInvitations().subscribe({ next: i => this.invitations.set(i) });
  }

  invite() {
    const email = this.inviteEmail.trim();
    this.inviteError.set(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.inviteError.set('Enter a valid email address.');
      return;
    }
    this.inviting.set(true);
    this.api.invite(email).subscribe({
      next: () => {
        this.inviting.set(false);
        this.inviteEmail = '';
        this.toast.success(`Invitation sent to ${email}. They accept it from their ReviewHood account.`);
        this.load();
      },
      error: err => {
        this.inviting.set(false);
        this.inviteError.set(apiErrorMessage(err, 'Could not send the invitation.'));
      }
    });
  }

  async cancelInvitation(invitation: Invitation) {
    const ok = await this.confirm.ask({ title: 'Cancel this invitation?', message: `${invitation.userEmail} won't be able to join with it anymore.`, confirmLabel: 'Cancel invitation', tone: 'danger' });
    if (!ok) return;
    this.api.cancelInvitation(invitation.id).subscribe({
      next: () => {
        this.toast.success('Invitation cancelled.');
        this.load();
      },
      error: err => this.toast.error(apiErrorMessage(err, 'Could not cancel the invitation.'))
    });
  }

  async changeRole(member: Membership, role: CompanyRole) {
    if (role === member.companyRole) return;
    if (role === 'HEAD') {
      const ok = await this.confirm.ask({
        title: `Make ${member.user.name} a head?`,
        message: 'Heads can manage the team and edit the company profile, like you.',
        confirmLabel: 'Make head',
      });
      if (!ok) {
        this.members.update(list => [...list]);
        return;
      }
    }
    this.busyId.set(member.user.id);
    this.api.changeRole(member.user.id, role).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(`${member.user.name} is now ${this.roleLabels[role].toLowerCase()}.`);
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not change the role.'));
        this.load();
      }
    });
  }

  async remove(member: Membership) {
    const ok = await this.confirm.ask({
      title: `Remove ${member.user.name}?`,
      message: 'They lose access to this portal right away. Their ReviewHood account stays.',
      confirmLabel: 'Remove', tone: 'danger',
    });
    if (!ok) return;
    this.busyId.set(member.user.id);
    this.api.removeMember(member.user.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(`${member.user.name} was removed from the team.`);
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not remove this member.'));
      }
    });
  }
}
