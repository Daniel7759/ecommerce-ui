import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User, LoginRequest, LoginResponse, AuthState } from '../model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://fakestoreapi.com';
  private readonly TOKEN_KEY = 'fakestore_token';
  private readonly USER_KEY = 'fakestore_user';

  // Estado de autenticación
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Observable público para que los componentes puedan suscribirse
  public authState$ = this.authState.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar si hay un token guardado al inicializar
    this.checkExistingAuth();
  }

  /**
   * Verifica si hay una sesión existente guardada
   */
  private checkExistingAuth(): void {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);
      
      if (token && userData) {
        try {
          const user: User = JSON.parse(userData);
          this.updateAuthState(true, user, token);
          console.log('🔐 Sesión existente encontrada para:', user.username);
        } catch (error) {
          console.error('Error al parsear datos de usuario guardados:', error);
          this.logout();
        }
      }
    }
  }

  /**
   * Realizar login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 Intentando login para:', credentials.username);
    
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login exitoso, obteniendo datos del usuario...');
          // Después del login exitoso, obtener datos del usuario
          this.getUserData(credentials.username, response.token);
        }),
        catchError(error => {
          console.error('❌ Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener datos del usuario después del login
   */
  private getUserData(username: string, token: string): void {
    // FakeStore no tiene endpoint para obtener usuario por username,
    // pero podemos usar algunos usuarios predefinidos para el demo
    const demoUsers: User[] = [
      {
        id: 1,
        email: 'john@gmail.com',
        username: 'johnd',
        name: { firstname: 'John', lastname: 'Doe' },
        address: {
          city: 'kilcoole',
          street: '7835 new road',
          number: 3,
          zipcode: '12926-3874',
          geolocation: { lat: '-37.3159', long: '81.1496' }
        },
        phone: '1-570-236-7033'
      },
      {
        id: 2,
        email: 'morrison@gmail.com',
        username: 'mor_2314',
        name: { firstname: 'David', lastname: 'Morrison' },
        address: {
          city: 'kilcoole',
          street: 'Lovers Ln',
          number: 7267,
          zipcode: '12926-3874',
          geolocation: { lat: '-37.3159', long: '81.1496' }
        },
        phone: '1-570-236-7033'
      },
      {
        id: 3,
        email: 'kevinryan@gmail.com',
        username: 'kevinryan',
        name: { firstname: 'Kevin', lastname: 'Ryan' },
        address: {
          city: 'Cullman',
          street: 'Frances Ct',
          number: 86,
          zipcode: '29567-1452',
          geolocation: { lat: '-34.6037', long: '150.1310' }
        },
        phone: '1-567-094-1345'
      }
    ];

    const user = demoUsers.find(u => u.username === username) || demoUsers[0];
    
    // Guardar token y usuario solo si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    
    // Actualizar estado
    this.updateAuthState(true, user, token);
    
    console.log('✅ Usuario autenticado:', user.username);
  }

  /**
   * Realizar logout
   */
  logout(): void {
    // Solo acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.updateAuthState(false, null, null);
    console.log('🔐 Sesión cerrada');
  }

  /**
   * Actualizar estado de autenticación
   */
  private updateAuthState(isAuthenticated: boolean, user: User | null, token: string | null): void {
    this.authState.next({
      isAuthenticated,
      user,
      token
    });
  }

  /**
   * Obtener estado actual de autenticación
   */
  getCurrentAuthState(): AuthState {
    return this.authState.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.authState.value.user;
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return this.authState.value.token;
  }

  /**
   * Obtener todos los usuarios (para demo)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }
}
