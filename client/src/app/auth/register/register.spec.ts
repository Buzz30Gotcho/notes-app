import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../api.config';
import { Register } from './register';

describe('Register', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      // Le faux serveur : aucune requête ne part vers le vrai back.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    const fixture = TestBed.createComponent(Register);
    expect(fixture.componentInstance).toBeTruthy();// verifie que le composant ne plante pas
  });

  it('should not call the API when the form is empty', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance as any; // accès à form et submit (protected)

    component.submit();

    httpMock.expectNone(`${API_BASE_URL}/auth/register`);
  });

  it('should not call the API when the password is too short', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance as any;

    component.form.setValue({ firstName: 'Camille', lastName: 'Martin', email: 'camille@example.com', password: '123' });
    component.submit();

    httpMock.expectNone(`${API_BASE_URL}/auth/register`);
  });

  it('should POST the form to /auth/register', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance as any;
    const formData = { firstName: 'Camille', lastName: 'Martin', email: 'camille@example.com', password: 'motdepasse123' };

    component.form.setValue(formData);
    component.submit();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(formData);
    req.flush({ accessToken: 'token', tokenType: 'Bearer', user: { id: '1', ...formData } });
  });

  it('should show a success message on 201', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance as any;

    component.form.setValue({ firstName: 'Camille', lastName: 'Martin', email: 'camille@example.com', password: 'motdepasse123' });
    component.submit();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/register`);
    req.flush(
      { accessToken: 'token', tokenType: 'Bearer', user: { id: '1', firstName: 'Camille', lastName: 'Martin', email: 'camille@example.com' } },
      { status: 201, statusText: 'Created' },
    );
    fixture.detectChanges(); // met à jour le HTML

    expect(fixture.nativeElement.textContent).toContain('Compte créé pour camille@example.com.');
  });

  it('should show an error message on 409', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance as any;

    component.form.setValue({ firstName: 'Camille', lastName: 'Martin', email: 'camille@example.com', password: 'motdepasse123' });
    component.submit();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/register`);
    req.flush({ message: 'Cette adresse e-mail est déjà utilisée.' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cette adresse e-mail est déjà utilisée.');
  });

  it('should show an error message on 400', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance as any;

    component.form.setValue({ firstName: 'Camille', lastName: 'Martin', email: 'camille@example.com', password: 'motdepasse123' });
    component.submit();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/register`);
    req.flush({ message: 'Les données envoyées sont invalides.' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Les données envoyées sont invalides.');
  });
});
