import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
