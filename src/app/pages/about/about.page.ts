import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, logoGithub, mail, heart } from 'ionicons/icons';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AboutPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    addIcons({
      'arrow-back': arrowBack,
      'logo-github': logoGithub,
      'mail': mail,
      'heart': heart
    });
  }

  goBack() {
    this.router.navigate(['/tabs/perfil']);
  }
}
