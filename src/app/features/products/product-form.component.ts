import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, from, last, of, toArray } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyApiService } from '../../core/api/company-api.service';
import { ProductImage, ProductStatus, Subcategory } from '../../core/api/models';
import { SharedService } from '../../core/services/sharedService/shared.service';
import { ToastService } from '../../core/ui/toast.service';
import { ConfirmService } from '../../core/ui/confirm.service';
import { apiErrorMessage } from '../../core/ui/api-error';
import { ArrowLeft, ImagePlus, LoaderCircle, Star, Trash2, TriangleAlert, X } from '../../core/ui/icons';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

interface NewImage {
  file: File;
  preview: string;
}

// Create and edit a product: /products/new and /products/:id/edit
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private api = inject(CompanyApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  public sharedService = inject(SharedService);

  readonly productId = signal<number | null>(null);
  readonly isEdit = computed(() => this.productId() !== null);
  readonly currentStatus = signal<ProductStatus | null>(null);

  name = '';
  description = '';
  subcategoryId: number | null = null;

  readonly subcategories = signal<Subcategory[]>([]);
  readonly images = signal<ProductImage[]>([]);
  // New product only: files waiting for the product to exist
  readonly queued = signal<NewImage[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly imageBusy = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  // Which buttons make sense for the product's current status
  readonly canSaveDraft = computed(() => !this.isEdit() || ['DRAFT', 'REJECTED'].includes(this.currentStatus() ?? ''));
  readonly primaryLabel = computed(() => {
    switch (this.currentStatus()) {
      case 'PENDING_REVIEW': return 'Save changes';
      case 'PUBLISHED': return 'Save and send for review';
      default: return 'Submit for review';
    }
  });

  readonly subcategoryGroups = computed(() => {
    const groups = new Map<string, Subcategory[]>();
    for (const s of this.subcategories()) {
      const key = s.categoryName ?? 'Other';
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    return [...groups.entries()].map(([category, items]) => ({ category, items }));
  });

  protected readonly icons = { ArrowLeft, ImagePlus, LoaderCircle, Star, Trash2, X, TriangleAlert };

  ngOnInit() {
    this.api.getSubcategories().subscribe({ next: s => this.subcategories.set(s) });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId.set(Number(id));
      this.load();
    }
  }

  ngOnDestroy() {
    this.queued().forEach(img => URL.revokeObjectURL(img.preview));
  }

  private load() {
    this.loading.set(true);
    this.api.getProduct(this.productId()!).subscribe({
      next: p => {
        if (p.status === 'ARCHIVED') {
          this.router.navigate(['/products', p.id]);
          return;
        }
        this.name = p.name;
        this.description = p.description ?? '';
        this.subcategoryId = p.subcategoryId;
        this.currentStatus.set(p.status);
        this.images.set(p.images);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load this product.'));
        this.loading.set(false);
      }
    });
  }

  // ── Images ──

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    const accepted = files.filter(file => {
      if (!IMAGE_TYPES.includes(file.type)) {
        this.toast.error(`${file.name}: only JPEG, PNG, WEBP, GIF or AVIF images are allowed.`);
        return false;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        this.toast.error(`${file.name} is larger than 10 MB.`);
        return false;
      }
      return true;
    });
    if (!accepted.length) return;

    if (!this.isEdit()) {
      this.queued.update(list => [...list, ...accepted.map(file => ({ file, preview: URL.createObjectURL(file) }))]);
      return;
    }

    // Editing: upload right away
    this.imageBusy.set(true);
    this.uploadAll(this.productId()!, accepted).subscribe(uploaded => {
      this.imageBusy.set(false);
      if (uploaded.length) {
        this.images.update(list => [...list, ...uploaded]);
        this.toast.success(uploaded.length === 1 ? 'Image added.' : `${uploaded.length} images added.`);
      }
    });
  }

  removeQueued(index: number) {
    URL.revokeObjectURL(this.queued()[index].preview);
    this.queued.update(list => list.filter((_, i) => i !== index));
  }

  setMain(image: ProductImage) {
    this.imageBusy.set(true);
    this.api.setMainImage(image.id, this.productId()!).subscribe({
      next: () => {
        this.imageBusy.set(false);
        this.images.update(list => list.map(i => ({ ...i, isMain: i.id === image.id })));
      },
      error: err => {
        this.imageBusy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not change the main image.'));
      }
    });
  }

  async deleteImage(image: ProductImage) {
    const ok = await this.confirm.ask({ title: 'Delete image?', message: 'The image is removed from the product right away.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    this.imageBusy.set(true);
    this.api.deleteImage(image.id).subscribe({
      next: () => {
        this.imageBusy.set(false);
        this.images.update(list => {
          const rest = list.filter(i => i.id !== image.id);
          return image.isMain && rest.length ? rest.map((i, idx) => ({ ...i, isMain: idx === 0 })) : rest;
        });
      },
      error: err => {
        this.imageBusy.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not delete the image.'));
      }
    });
  }

  // One by one, so the first upload becomes the main image; failures are reported and skipped
  private uploadAll(productId: number, files: File[]) {
    return from(files).pipe(
      concatMap(file => this.api.uploadProductImage(productId, file).pipe(
        catchError(err => {
          this.toast.error(`${file.name}: ${apiErrorMessage(err, 'upload failed')}`);
          return of(null);
        })
      )),
      toArray(),
      concatMap(results => of(results.filter((r): r is ProductImage => r !== null))),
      last()
    );
  }

  // ── Save ──

  async save(status: 'DRAFT' | 'PENDING_REVIEW') {
    this.submitted.set(true);
    this.error.set(null);
    if (!this.name.trim()) {
      this.error.set('Give your product a name.');
      return;
    }
    if (status === 'PENDING_REVIEW' && !this.subcategoryId) {
      this.error.set('Pick a category before submitting, so customers can find the product.');
      return;
    }
    if (this.currentStatus() === 'PUBLISHED') {
      const ok = await this.confirm.ask({
        title: 'Send this product back for review?',
        message: 'Your product is live. After this change it is hidden from customers until ReviewHood approves it again. Image changes don\'t need a review.',
        confirmLabel: 'Save and send',
      });
      if (!ok) return;
    }

    const payload = {
      name: this.name.trim(),
      description: this.description.trim() || null,
      subcategoryId: this.subcategoryId ? Number(this.subcategoryId) : null,
      status,
    };

    this.saving.set(true);
    const id = this.productId();
    const request$ = id ? this.api.updateProduct(id, payload) : this.api.createProduct(payload);

    request$.subscribe({
      next: product => {
        const done = () => {
          this.saving.set(false);
          this.toast.success(status === 'DRAFT' ? 'Draft saved.' : this.currentStatus() === 'PENDING_REVIEW' ? 'Changes saved.' : 'Submitted. ReviewHood will review your product soon.');
          this.router.navigate(['/products', product.id]);
        };
        const files = this.queued().map(q => q.file);
        if (!id && files.length) {
          this.uploadAll(product.id, files).subscribe(done);
        } else {
          done();
        }
      },
      error: err => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(err, 'Could not save the product.'));
      }
    });
  }

  cancel() {
    this.router.navigate(this.isEdit() ? ['/products', this.productId()] : ['/products']);
  }
}
