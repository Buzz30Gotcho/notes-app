import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { API_BASE_URL } from '../../api.config';
import { AuthResponse } from '../auth.models';
import { Register } from './register';

// ─── Données de test, copiées des exemples du contrat (openapi.yaml) ───
const REGISTER_URL = `${API_BASE_URL}/auth/register`;

const VALID_FORM = {
  firstName: 'Camille',
  lastName: 'Martin',
  email: 'camille@example.com',
  password: 'motdepasse123',
};

const AUTH_RESPONSE: AuthResponse = {
  accessToken: 'fake-jwt-token',
  tokenType: 'Bearer',
  user: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    firstName: 'Camille',
    lastName: 'Martin',
    email: 'camille@example.com',
  },
};

// form et submit sont "protected" dans register.ts : ce type permet d'y accéder dans le test.
type RegisterInternals = { form: FormGroup; submit: () => void };

describe('Register', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<Register>;
  let component: RegisterInternals;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance as unknown as RegisterInternals;
    fixture.detectChanges(); // premier affichage du formulaire
  });

  afterEach(() => httpMock.verify());

  // ─── Petites fonctions utilitaires pour éviter de répéter le code ───

  /** Simule l'utilisateur : remplit le formulaire (valide par défaut) puis valide. */
  function submitForm(overrides: Partial<typeof VALID_FORM> = {}): void {
    component.form.setValue({ ...VALID_FORM, ...overrides });
    component.submit();
    fixture.detectChanges();
  }

  /** Renvoie le texte affiché dans un élément du HTML (ou undefined s'il n'est pas affiché). */
  function textOf(selector: string): string | undefined {
    return fixture.nativeElement.querySelector(selector)?.textContent?.trim();
  }

  // ─── Tests ───

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not call the API when the form is empty', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    button.click();

    httpMock.expectNone(REGISTER_URL);
  });

  it('should POST the form data to /auth/register', () => {
    submitForm();

    const req = httpMock.expectOne(REGISTER_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(VALID_FORM);
    req.flush(AUTH_RESPONSE, { status: 201, statusText: 'Created' });
  });

  // ── Contrat : 201 Compte créé ──
  it('should show a success message and reset the form on 201', () => {
    submitForm();

    httpMock.expectOne(REGISTER_URL).flush(AUTH_RESPONSE, { status: 201, statusText: 'Created' });
    fixture.detectChanges(); // met à jour l'affichage après la réponse

    expect(textOf('.success')).toBe('Compte créé pour camille@example.com.');
    expect(textOf('.error')).toBeUndefined();
    expect(component.form.getRawValue()).toEqual({ firstName: '', lastName: '', email: '', password: '' });
  });

  // ── Contrat : 409 E-mail déjà utilisé ──
  it('should show the API message on 409', () => {
    submitForm();

    httpMock
      .expectOne(REGISTER_URL)
      .flush({ message: 'Cette adresse e-mail est déjà utilisée.' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(textOf('.error')).toBe('Cette adresse e-mail est déjà utilisée.');
    expect(textOf('.success')).toBeUndefined();
  });

  // ── Contrat : 400 Données invalides ──
  it('should show the API message on 400', () => {
    submitForm();

    httpMock
      .expectOne(REGISTER_URL)
      .flush({ message: 'Les données envoyées sont invalides.' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(textOf('.error')).toBe('Les données envoyées sont invalides.');
  });

  // ── Hors contrat : le serveur plante ──
  it('should show a generic message on 500', () => {
    submitForm();

    httpMock.expectOne(REGISTER_URL).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(textOf('.error')).toBe('Une erreur est survenue. Réessayez plus tard.');
  });

  // ── Contrat : password minLength 8 → le front bloque avant d'appeler l'API ──
  it('should not call the API when the password is shorter than 8 characters', () => {
    submitForm({ password: '1234567' });

    httpMock.expectNone(REGISTER_URL);
  });

  // ── Contrat : email format email ──
  it('should not call the API when the email is invalid', () => {
    submitForm({ email: 'pas-un-email' });

    httpMock.expectNone(REGISTER_URL);
  });

  // ── Expérience utilisateur : bouton désactivé pendant l'envoi ──
  it('should disable the button while the request is pending', () => {
    submitForm();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Pendant : le serveur n'a pas encore répondu
    expect(button.disabled).toBe(true);
    expect(button.textContent?.trim()).toBe('Création…');

    httpMock.expectOne(REGISTER_URL).flush(AUTH_RESPONSE, { status: 201, statusText: 'Created' });
    fixture.detectChanges();

    // Après : le bouton est de nouveau utilisable
    expect(button.disabled).toBe(false);
    expect(button.textContent?.trim()).toBe('Créer mon compte');
  });
});
