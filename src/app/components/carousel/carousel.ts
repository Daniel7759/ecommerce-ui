import { Component, Input, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FlowbiteService } from '../../services/flowbite.service';

export interface CarouselSlide {
  image: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonAction?: () => void;
  alt?: string;
}

@Component({
  selector: 'app-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css'
})
export class Carousel implements OnInit, OnDestroy, AfterViewInit {
  
  @Input() slides: CarouselSlide[] = [];
  @Input() autoSlide: boolean = true;
  @Input() slideInterval: number = 5000; // 5 segundos por defecto
  @Input() showIndicators: boolean = true;
  @Input() showControls: boolean = true;
  @Input() height: string = 'h-56 md:h-96 lg:h-[500px]';
  currentSlideIndex: number = 0;
  private intervalId: any;
  carouselId: string; // Hacer público para el template

  constructor(
    private flowbiteService: FlowbiteService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Generar ID único para cada instancia del carrusel
    this.carouselId = 'carousel-' + Math.random().toString(36).substr(2, 9);
  }

  ngOnInit(): void {
    // Si no hay slides, crear algunos por defecto
    if (this.slides.length === 0) {
      this.setDefaultSlides();
    }

    // Iniciar auto-slide si está habilitado
    if (this.autoSlide && isPlatformBrowser(this.platformId)) {
      this.startAutoSlide();
    }
  }

  ngAfterViewInit(): void {
    // Inicializar Flowbite después de que la vista se cargue
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.flowbiteService.loadFlowbite((flowbite) => {
          flowbite.initFlowbite();
          console.log('🎠 Carousel Flowbite inicializado:', this.carouselId);
        });
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  private setDefaultSlides(): void {
    this.slides = [
      {
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        title: 'Bienvenido a FakeStore',
        subtitle: 'Descubre los mejores productos al mejor precio',
        buttonText: 'Explorar Productos',
        alt: 'Banner Principal'
      },
      {
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        title: 'Ropa de Hombre',
        subtitle: 'Estilo y elegancia para cada ocasión',
        alt: 'Ropa de Hombre'
      },
      {
        image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        title: 'Ropa de Mujer',
        subtitle: 'Moda femenina de última tendencia',
        alt: 'Ropa de Mujer'
      },
      {
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        title: 'Electrónicos',
        subtitle: 'Tecnología de vanguardia',
        alt: 'Electrónicos'
      }
    ];
  }

  private startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, this.slideInterval);
  }

  private stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlideIndex = this.currentSlideIndex === 0 
      ? this.slides.length - 1 
      : this.currentSlideIndex - 1;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    // Pausar auto-slide temporalmente cuando el usuario interactúa
    if (this.autoSlide) {
      this.stopAutoSlide();
      setTimeout(() => {
        this.startAutoSlide();
      }, 3000); // Reanudar después de 3 segundos
    }
  }

  onSlideClick(slide: CarouselSlide): void {
    if (slide.buttonAction) {
      slide.buttonAction();
    }
  }

  // Método para pausar/reanudar auto-slide al hacer hover
  onMouseEnter(): void {
    if (this.autoSlide) {
      this.stopAutoSlide();
    }
  }

  onMouseLeave(): void {
    if (this.autoSlide) {
      this.startAutoSlide();
    }
  }
}
