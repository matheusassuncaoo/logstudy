import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthResponse, LoginDto, RegisterDto, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private supabase: SupabaseService) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();

    // Escutar mudanças de autenticação do Supabase
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        this.clearAuthData();
      }
    });

    // Verificar sessão existente
    this.checkSession();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  register(data: RegisterDto): Observable<AuthResponse> {
    return from(this.registerUser(data)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async registerUser(data: RegisterDto): Promise<AuthResponse> {
    if (!data.email || !data.password || !data.name) {
      throw new Error('Todos os campos são obrigatórios');
    }

    if (data.password !== data.confirmPassword) {
      throw new Error('As senhas não conferem');
    }

    if (!data.termsAccepted || !data.privacyAccepted) {
      throw new Error('Você deve aceitar os Termos de Uso e Política de Privacidade');
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name
        },
        emailRedirectTo: undefined // Desabilitar redirect de confirmação
      }
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Erro ao criar usuário');

    // Se email confirmation estiver habilitado, authData.session será null
    // Nesse caso, informamos ao usuário
    if (!authData.session) {
      // Criar objeto User mesmo sem sessão
      const user: User = {
        id: authData.user.id,
        name: data.name,
        email: data.email,
        avatar: undefined,
        isActive: false, // Inativo até confirmar email
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: undefined
      };

      throw new Error(`Conta criada! Verifique seu email (${data.email}) para confirmar o cadastro.`);
    }

    // O trigger handle_new_user() cria automaticamente:
    // - Registro na tabela users
    // - Registro na tabela user_preferences

    // Criar objeto User a partir dos dados do Auth
    // (o trigger já criou no banco, mas usamos os dados que temos)
    const user: User = {
      id: authData.user.id,
      name: data.name,
      email: data.email,
      avatar: undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: undefined
    };

    const response: AuthResponse = {
      user,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresIn: authData.session.expires_in
    };

    this.handleAuthResponse(response);
    return response;
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return from(this.loginUser(credentials)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async loginUser(credentials: LoginDto): Promise<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email e senha são obrigatórios');
    }

    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (authError) throw new Error('Email ou senha incorretos');
    if (!authData.user || !authData.session) throw new Error('Erro ao fazer login');

    const { data: userData, error: userError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      console.error('Erro ao buscar usuário:', userError);
      console.log('User ID do Auth:', authData.user.id);
      console.log('Email:', authData.user.email);
      throw new Error('Perfil de usuário não encontrado. Entre em contato com o suporte.');
    }
    if (!userData.is_active) throw new Error('Usuário inativo');

    await this.supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id);

    const user = this.mapUser(userData);

    const response: AuthResponse = {
      user,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresIn: authData.session.expires_in
    };

    this.handleAuthResponse(response);
    if (credentials.rememberMe) localStorage.setItem('rememberMe', 'true');

    return response;
  }

  logout(): Observable<any> {
    return from(this.logoutUser());
  }

  private async logoutUser(): Promise<void> {
    await this.supabase.auth.signOut();
    this.clearAuthData();
  }

  refreshToken(): Observable<AuthResponse> {
    return from(this.refreshUserToken()).pipe(
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  private async refreshUserToken(): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.refreshSession();
    if (error || !data.session || !data.user) throw new Error('Token inválido');

    const { data: userData } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!userData) throw new Error('Usuário não encontrado');

    const user = this.mapUser(userData);
    const response: AuthResponse = {
      user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in
    };

    this.handleAuthResponse(response);
    return response;
  }

  private async checkSession(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    if (data.session?.user) {
      await this.loadUserProfile(data.session.user.id);
    } else {
      // Garante consistência: se não houver sessão válida, limpa qualquer usuário persistido
      this.clearAuthData();
    }
  }

  private async loadUserProfile(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      const user = this.mapUser(data);
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  private mapUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined
    };
  }

  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  resetPassword(email: string): Observable<void> {
    return from(this.sendPasswordReset(email)).pipe(
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

  private async sendPasswordReset(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw new Error(error.message);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    this.currentUserSubject.next(null);
  }
}
