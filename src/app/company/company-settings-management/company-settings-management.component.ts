import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-settings-management.component.html',
  styleUrl: './company-settings-management.component.css'
})
export class CompanySettingsManagementComponent {

  saving = false;

  company = {
    name: 'TuniRate',
    description: 'A platform for product reviews and ratings',
    email: 'contact@tuniRate.com',
    phone: '+216 99 999 999',
    address: 'Tunis, Tunisia',
    website: 'https://tunirate.com',
    verified: true
  };

  saveSettings() {
    this.saving = true;

    console.log('Saving company settings...', this.company);

    setTimeout(() => {
      this.saving = false;
      alert('Settings saved successfully (static mode)');
    }, 800);
  }

}