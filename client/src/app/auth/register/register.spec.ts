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
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    const fixture = TestBed.createComponent(Register);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not call the API when the form is empty', () => {
    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    button.click();

    httpMock.expectNone(`${API_BASE_URL}/auth/register`);
  });

  it('should POST to /auth/register when the form is valid', () => {
    const fixture = TestBed.createComponent(Register);
    // Accès aux membres protégés pour piloter le test.
    const component = fixture.componentInstance as unknown as {
      form: { setValue: (v: unknown) => void };
      submit: () => void;
    };

    component.form.setValue({
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille@example.com',
      password: 'motdepasse123',
    });
    component.submit();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      user: { id: '1', firstName: 'Camille', lastName: 'Martin', email: 'camille@example.com' },
    });
  });
});
