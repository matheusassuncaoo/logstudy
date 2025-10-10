import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TermsPage implements OnInit {
  lastUpdate = 'Outubro de 2025';
  showAcceptButton = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Show accept button only during registration flow
    this.route.queryParams.subscribe(params => {
      this.showAcceptButton = params['from'] === 'register';
    });
  }

  goToPrivacy() {
    this.router.navigate(['/privacy']);
  }

  acceptTerms() {
    // Store acceptance and navigate back to register
    localStorage.setItem('termsAccepted', 'true');
    localStorage.setItem('termsAcceptedDate', new Date().toISOString());
    this.router.navigate(['/register']);
  }
}
