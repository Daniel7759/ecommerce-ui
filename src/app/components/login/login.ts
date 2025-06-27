import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  
  loginForm!: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  returnUrl: string = '/';
  
  private destroy$ = new Subject<void>();

  // Usuarios demo para mostrar en la interfaz
  demoUsers = [
    { username: 'johnd', password: 'm38rmF$', name: 'John Doe' },
    { username: 'mor_2314', password: '83r5^_', name: 'David Morrison' },
    { username: 'kevinryan', password: 'kev02937@', name: 'Kevin Ryan' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Crear formulario
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Obtener URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Manejar envío del formulario
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      const credentials = this.loginForm.value;
      console.log('🔐 Intentando login con:', credentials);

      this.authService.login(credentials)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Login exitoso:', response);
            this.loading = false;
            // Redirigir a la URL de retorno o al home
            this.router.navigate([this.returnUrl]);
          },
          error: (error) => {
            console.error('❌ Error en login:', error);
            this.loading = false;
            this.error = 'Credenciales inválidas. Por favor, intenta de nuevo.';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Llenar formulario con usuario demo
   */
  fillDemoUser(user: any): void {
    this.loginForm.patchValue({
      username: user.username,
      password: user.password
    });
  }

  /**
   * Marcar todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene errores
   */
  hasError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) {
        return `${field === 'username' ? 'Usuario' : 'Contraseña'} es requerido`;
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `Mínimo ${minLength} caracteres`;
      }
    }
    return '';
  }
}
