import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

import { CompanyHeaderComponent } from "../company-header/company-header.component";
import { CompanySidebarComponent } from "../company-sidebar/company-sidebar.component";

@Component({
  selector: 'app-company-main',
  imports: [RouterOutlet, CompanyHeaderComponent, CompanySidebarComponent],
  templateUrl: './company-main.component.html',
  styleUrl: './company-main.component.css'
})
export class CompanyMainComponent {

}
