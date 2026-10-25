import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

import { AuthService } from '../../../features/auth/services/authService/auth.service';
import { CompanyContextService } from '../../api/company-context.service';
import { SharedService } from '../../services/sharedService/shared.service';
import { OverlaysComponent } from '../../ui/overlays.component';
import { initials } from '../../ui/format';
import { Building2, ChevronDown, LayoutDashboard, LogOut, Menu, MessageSquare, Package, Users, X } from '../../ui/icons';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIconData;
  exact?: boolean;
  headOnly?: boolean;
  badge?: () => number;
}

// Sidebar + top bar around every signed-in page
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, OverlaysComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private host = inject(ElementRef);
  readonly context = inject(CompanyContextService);
  readonly sharedService = inject(SharedService);

  readonly user = toSignal(this.authService.currentUser$);
  readonly menuOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly initials = initials;

  private readonly items: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Reviews', path: '/reviews', icon: MessageSquare, badge: () => this.context.unansweredReviews() },
    { label: 'Team', path: '/team', icon: Users, headOnly: true },
    { label: 'Company profile', path: '/profile', icon: Building2, headOnly: true },
  ];
  readonly nav = computed(() => this.items.filter(i => !i.headOnly || this.context.isHead()));

  protected readonly icons = { Menu, X, LogOut, ChevronDown };

  constructor() {
    this.context.refresh();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
      this.userMenuOpen.set(false);
      this.context.refreshCounts();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Close the user menu when clicking anywhere else
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menu = this.host.nativeElement.querySelector('[data-user-menu]');
    if (menu && !menu.contains(event.target)) this.userMenuOpen.set(false);
  }
}
