import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyApiService } from '../../core/api/company-api.service';
import { CompanyContextService } from '../../core/api/company-context.service';
import { Company, CompanyProfileRequest } from '../../core/api/models';
import { Country } from '../../core/model/enums/country.enum.model';
import { Industry } from '../../core/model/enums/industry.enum.model';
import { SocialPlatform } from '../../core/model/enums/socialPlatform.enum.model';
import { SOCIAL_ICON_MAP } from '../../core/mapping/social-icon-map';
import { SharedService } from '../../core/services/sharedService/shared.service';
import { BadgeComponent } from '../../core/ui/badge.component';
import { ToastService } from '../../core/ui/toast.service';
import { apiErrorMessage } from '../../core/ui/api-error';
import { humanize } from '../../core/ui/format';
import { ImagePlus, Info, LoaderCircle, Plus, Trash2 } from '../../core/ui/icons';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

// The company head edits how the company appears to customers
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, BadgeComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private api = inject(CompanyApiService);
  private context = inject(CompanyContextService);
  private toast = inject(ToastService);
  public sharedService = inject(SharedService);

  readonly company = signal<Company | null>(null);
  form: CompanyProfileRequest = { description: '', phoneNumber: null, address: null, country: Country.TUNISIA, industry: Industry.OTHER, socialLinks: [] };

  logoFile?: File;
  bannerFile?: File;
  readonly logoPreview = signal<string | null>(null);
  readonly bannerPreview = signal<string | null>(null);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  readonly countries = Object.values(Country);
  readonly industries = Object.values(Industry);
  readonly platforms = Object.values(SocialPlatform);
  readonly socialIcons = SOCIAL_ICON_MAP;
  readonly humanize = humanize;
  protected readonly icons = { ImagePlus, LoaderCircle, Plus, Trash2, Info };

  ngOnInit() {
    this.api.getMyCompany().subscribe({
      next: c => {
        this.fill(c);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load your company.'));
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy() {
    [this.logoPreview(), this.bannerPreview()].forEach(url => url && URL.revokeObjectURL(url));
  }

  private fill(c: Company) {
    this.company.set(c);
    this.form = {
      description: c.description ?? '',
      phoneNumber: c.phoneNumber,
      address: c.address,
      country: c.country,
      industry: c.industry ?? Industry.OTHER,
      socialLinks: (c.socialLinks ?? []).map(l => ({ platform: l.platform, url: l.url })),
    };
  }

  onImageSelected(event: Event, kind: 'logo' | 'banner') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      this.toast.error('Only JPEG, PNG, WEBP, GIF or AVIF images are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('Images must be smaller than 10 MB.');
      return;
    }
    const preview = URL.createObjectURL(file);
    if (kind === 'logo') {
      if (this.logoPreview()) URL.revokeObjectURL(this.logoPreview()!);
      this.logoFile = file;
      this.logoPreview.set(preview);
    } else {
      if (this.bannerPreview()) URL.revokeObjectURL(this.bannerPreview()!);
      this.bannerFile = file;
      this.bannerPreview.set(preview);
    }
  }

  addLink() {
    const used = new Set(this.form.socialLinks.map(l => l.platform));
    this.form.socialLinks.push({ platform: this.platforms.find(p => !used.has(p)) ?? SocialPlatform.WEBSITE, url: '' });
  }

  removeLink(index: number) {
    this.form.socialLinks.splice(index, 1);
  }

  save() {
    this.submitted.set(true);
    this.error.set(null);
    if (this.form.socialLinks.some(l => !/^https?:\/\/\S+\.\S+/.test(l.url.trim()))) {
      this.error.set('Every link must be a full address starting with http:// or https://');
      return;
    }

    const payload: CompanyProfileRequest = {
      ...this.form,
      description: this.form.description?.trim() || null,
      phoneNumber: this.form.phoneNumber?.trim() || null,
      address: this.form.address?.trim() || null,
      socialLinks: this.form.socialLinks.map(l => ({ platform: l.platform, url: l.url.trim() })),
    };

    this.saving.set(true);
    this.api.updateMyCompany(payload, this.logoFile, this.bannerFile).subscribe({
      next: c => {
        this.saving.set(false);
        this.logoFile = this.bannerFile = undefined;
        this.logoPreview.set(null);
        this.bannerPreview.set(null);
        this.fill(c);
        this.context.refresh();
        this.toast.success('Company profile saved.');
      },
      error: err => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(err, 'Could not save the profile.'));
      }
    });
  }
}
