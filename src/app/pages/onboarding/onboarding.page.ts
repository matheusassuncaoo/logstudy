import { Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { book, calendar, time, notifications } from 'ionicons/icons';

interface OnboardingSlide {
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OnboardingPage implements AfterViewInit {
  @ViewChild('slides', { static: false }) slides: any;

  currentSlide = 0;
  swiperReady = false;

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    }
  };

  onboardingSlides: OnboardingSlide[] = [
    {
      title: '<span class="highlight">Bem -vindo ao</span><br><span class="highlight">LogStudy!</span>',
      description: 'Domine seus estudos criando rotinas poderosas e aproveitando a técnica Pomodoro para o foco máximo.',
      icon: 'book',
      gradient: 'linear-gradient(135deg, #00F1FF, #290CFF)'
    },
    {
      title: 'Elabore sua<br>Rotina de Estudos',
      description: 'Crie planos de estudo personalizados. Defina matérias, a duração das sessões e os tempos de pausa para construir uma rotina que funcione para você.',
      icon: 'calendar',
      gradient: 'linear-gradient(135deg, #290CFF, #9B00E8)'
    },
    {
      title: 'Técnica Pomodoro',
      description: 'Utilize sessões de foco intenso seguidas de pausas estratégicas para maximizar seu aprendizado e manter a produtividade.',
      icon: 'time',
      gradient: 'linear-gradient(135deg, #0161E8, #9B00E8)'
    }
  ];

  constructor(private router: Router) {
    // Registrar ícones do Ionicons
    addIcons({
      'book': book,
      'calendar': calendar,
      'time': time,
      'notifications': notifications
    });
  }

  ngAfterViewInit() {
    // Wait for swiper to initialize with multiple checks
    const initSwiper = () => {
      if (this.slides?.nativeElement?.swiper) {
        this.swiperReady = true;
        console.log('✅ Swiper inicializado com sucesso');
        console.log('Total de slides:', this.slides.nativeElement.swiper.slides.length);
      } else {
        console.warn('⚠️ Swiper não inicializou ainda, tentando novamente...');
        setTimeout(initSwiper, 200);
      }
    };
    
    setTimeout(initSwiper, 300);
  }

  slideChanged() {
    if (this.swiperReady && this.slides?.nativeElement?.swiper) {
      this.currentSlide = this.slides.nativeElement.swiper.activeIndex;
      console.log('Slide atual:', this.currentSlide);
    }
  }

  nextSlide() {
    console.log('🔘 Botão Continuar clicado');
    
    if (!this.slides?.nativeElement?.swiper) {
      console.error('❌ Swiper não está disponível');
      // Tentar navegar diretamente se for o último slide esperado
      if (this.currentSlide >= 2) {
        this.finish();
      }
      return;
    }

    const swiper = this.slides.nativeElement.swiper;
    const currentIndex = swiper.activeIndex;
    const totalSlides = swiper.slides.length;
    
    console.log('📊 Estado atual:', {
      currentIndex,
      totalSlides,
      isEnd: swiper.isEnd,
      isBeginning: swiper.isBeginning
    });
    
    if (currentIndex >= totalSlides - 1) {
      console.log('✅ Último slide alcançado, finalizando onboarding...');
      this.finish();
    } else {
      console.log('➡️ Avançando para próximo slide...');
      swiper.slideNext();
      
      // Verificar se realmente mudou
      setTimeout(() => {
        console.log('📍 Novo índice:', swiper.activeIndex);
      }, 100);
    }
  }

  skip() {
    this.router.navigate(['/auth']);
  }

  finish() {
    // Mark onboarding as completed
    localStorage.setItem('onboardingCompleted', 'true');
    this.router.navigate(['/auth']);
  }
}
