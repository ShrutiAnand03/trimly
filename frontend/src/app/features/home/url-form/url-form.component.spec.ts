import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UrlFormComponent } from './url-form.component';

describe('UrlFormComponent', () => {
  let fixture: ComponentFixture<UrlFormComponent>;
  let component: UrlFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** Types a value into the URL input and syncs the reactive form. */
  function setUrl(value: string): void {
    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submit(): void {
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  }

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('emits the URL when a valid one is submitted', () => {
    const emitted: string[] = [];
    component.submitted.subscribe((url) => emitted.push(url));

    setUrl('https://example.com');
    submit();

    expect(emitted).toEqual(['https://example.com']);
  });

  it('trims whitespace before emitting', () => {
    const emitted: string[] = [];
    component.submitted.subscribe((url) => emitted.push(url));

    setUrl('  https://example.com  ');
    submit();

    expect(emitted).toEqual(['https://example.com']);
  });

  it('does not emit when the URL is invalid', () => {
    const emitted: string[] = [];
    component.submitted.subscribe((url) => emitted.push(url));

    setUrl('not-valid');
    submit();

    expect(emitted).toEqual([]);
  });

  it('does not emit when the form is empty', () => {
    const emitted: string[] = [];
    component.submitted.subscribe((url) => emitted.push(url));

    submit();

    expect(emitted).toEqual([]);
  });

  it('shows a validation message after submitting an invalid URL', () => {
    setUrl('not-valid');
    submit();

    const error = fixture.debugElement.query(By.css('.url-form__error'));
    expect(error.nativeElement.textContent).toContain('valid URL');
  });

  it('shows a required message when submitting empty', () => {
    submit();

    const error = fixture.debugElement.query(By.css('.url-form__error'));
    expect(error.nativeElement.textContent).toContain('Please enter a URL');
  });

  it('disables the submit button while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.query(
      By.css('button[type="submit"]'),
    ).nativeElement;

    expect(button.disabled).toBe(true);
  });

  it('does not emit while loading, preventing duplicate submissions', () => {
    const emitted: string[] = [];
    component.submitted.subscribe((url) => emitted.push(url));

    setUrl('https://example.com');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    submit();

    expect(emitted).toEqual([]);
  });
});
