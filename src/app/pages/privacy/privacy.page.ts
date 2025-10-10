import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton } from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
  standalone: true,
  imports: [IonButton, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PrivacyPage implements OnInit {
  lastUpdate = new Date().toLocaleDateString('pt-BR');
  showAcceptButton = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['from'] === 'register') {
        this.showAcceptButton = true;
      }
    });
  }

  acceptPrivacy() {
    localStorage.setItem('privacyAccepted', 'true');
    localStorage.setItem('privacyAcceptedDate', new Date().toISOString());
    this.router.navigate(['/register']);
  }

  goToTerms() {
    this.router.navigate(['/terms']);
  }

}
