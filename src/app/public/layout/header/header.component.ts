import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/authService/auth.service';
import { CategoryService } from '../../../core/services/categoryService/category.service';
import { SubcategoryService } from '../../../core/services/subcategoryService/subcategory.service';
import { SearchService } from '../../../core/services/searchService/search.service';
import { CompanyInvitationService } from '../../../core/services/companyInvitationService/company-invitation.service';
import { CompanyService } from '../../../core/services/companyService/company.service';
import { SharedService } from '../../../core/services/sharedService/shared.service';


type HeaderCategory = any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  @Output() searchChange = new EventEmitter<string>();

  currentUser$: any;

  categories: HeaderCategory[] = [];
  loadingCategories = false;

  selectedCategoryId: number | null = null;

  // SEARCH
  searchQuery = '';

  suggestions: {
    id: number;
    name: string;
    type: 'PRODUCT' | 'COMPANY';
    logoUrl?: string;
    verified?: boolean;
  }[] = [];

  company: any;

  // simple search index (products + companies etc)
  searchIndex: string[] = [];

  constructor(
    public authService: AuthService,
    private router: Router,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private searchService: SearchService,
    private companyInvitationService: CompanyInvitationService,
    public sharedService: SharedService,
    private companyService: CompanyService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadCompany();
    this.loadCategories();
    this.loadInvitations();
  }

  /* ---------------- SEARCH ---------------- */




  loadCompany(){
    if (this.authService.isCompanyMember()) {
      this.companyService.getMyCompany().subscribe({
        next: company => {
          this.company = company;
        }
      });
    }
  }


  onSearch(): void {
    const query = this.searchQuery.trim();
    this.searchChange.emit(query);

    if (!query) {
      this.suggestions = [];
      return;
    }

    this.searchService.search(query).subscribe({
      next: (res) => {

        const products = (res.products || []).map(product => ({
          id: product.id,
          name: product.name,
          type: 'PRODUCT' as const,
          logoUrl: product.imageUrl,
          verified: false
        }));

        const companies = (res.companies || []).map(company => ({
          id: company.id,
          name: company.name,
          type: 'COMPANY' as const,
          logoUrl: company.logoUrl,
          verified: company.verified ?? false
        }));

        this.suggestions = [...products, ...companies]
          // safer duplicate removal (type + id)
          .filter((item, index, arr) =>
            index === arr.findIndex(x => x.id === item.id && x.type === item.type)
          )
          .slice(0, 6);
      },

      error: (err) => {
        console.error('Search failed', err);
        this.suggestions = [];
      }
    });
  }



  selectSuggestion(item: {id: number;name: string;type: 'PRODUCT' | 'COMPANY';logoUrl?: string;}): void {

    this.searchQuery = item.name;
    this.suggestions = [];
    this.searchChange.emit(item.name);

    if (item.type === 'COMPANY') {
      this.router.navigate(['/company', item.id]);
    } else {
      this.router.navigate(['/product', item.id]);
    }

  }

  /* ---------------- CATEGORY ---------------- */

  toggleCategory(categoryId: number): void {
    this.selectedCategoryId =
      this.selectedCategoryId === categoryId ? null : categoryId;
  }

  clearSelection(): void {
    this.selectedCategoryId = null;
  }

  activeCategory(): HeaderCategory | undefined {
    return this.categories.find(c => c.id === this.selectedCategoryId);
  }

  /* ---------------- AUTH ---------------- */

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  goAdmin(): void {
    this.router.navigate(['/admin']);
  }

  goCompanyDashboard(): void {
    this.router.navigate(['/c']);
  }

  /* ---------------- DATA ---------------- */

  loadCategories(): void {
    this.loadingCategories = true;

    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.subcategoryService.getAllSubcategories().subscribe({
          next: (subcategories) => {

            this.categories = (categories ?? []).map(category => ({
              ...category,
              subcategories: (subcategories ?? [])
                .filter(s => s.categoryId === category.id)
                .map(s => ({ id: s.id, name: s.name }))
            }));

            // build search index
            this.buildSearchIndex();

            this.loadingCategories = false;
          },
          error: () => {
            this.categories = [];
            this.loadingCategories = false;
          }
        });
      },
      error: () => {
        this.categories = [];
        this.loadingCategories = false;
      }
    });
  }

  buildSearchIndex(): void {
    this.searchIndex = [];

    for (const cat of this.categories) {
      this.searchIndex.push(cat.name);

      for (const sub of cat.subcategories || []) {
        this.searchIndex.push(sub.name);
      }
    }
  }

  //Notification logic

  invitations: any[] = [];
  invitationCount = 0;
  showInvitations = false;

  toggleInvitations() {
    this.showInvitations = !this.showInvitations;
    if (this.showInvitations) {
      this.loadInvitations();
    }
  }

  loadInvitations() {
    this.companyInvitationService.getMyInvitations()
      .subscribe(res => {
        this.invitations = res;
        this.invitationCount = res.filter(i => i.status === 'PENDING').length;
      });
  }

  accept(id: number) {
    this.companyInvitationService.acceptInvitation(id)
      .subscribe(() => this.loadInvitations());
  }

  reject(id: number) {
    this.companyInvitationService.rejectInvitation(id)
      .subscribe(() => this.loadInvitations());
  }




}