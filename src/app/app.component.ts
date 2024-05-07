import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, VERSION } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';

export function emailArrayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let isPassed: boolean = true;

    if (Array.isArray(control.value)) {
      for (const email of control.value) {
        const innerControl: FormControl = new FormControl(
          email,
          Validators.email
        );
        if (innerControl.errors && innerControl.errors.email) {
          isPassed = false;
          break;
        }
      }
    } else {
      isPassed = false;
    }

    return isPassed ? null : { emailArray: true };
  };
}

export function requiredArrayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isPassed: boolean =
      Array.isArray(control.value) && control.value.length > 0;
    return isPassed ? null : { required: true };
  };
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public version: string = VERSION.full;
  public emailFormControl: FormControl = new FormControl(
    [],
    [requiredArrayValidator(), emailArrayValidator()]
  );

  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public oldForm: FormGroup = new FormGroup({
    email: new FormControl([], Validators.required),
    emailHelper: new FormControl(null, Validators.email)
  });

  public addEmailAddress(event: MatChipInputEvent): void {
    const formControl: AbstractControl = this.oldForm.get('email');
    const helperForm: AbstractControl = this.oldForm.get('emailHelper');
    const input: HTMLInputElement = event.input;
    const value: string = (event.value || '').trim();

    helperForm.updateValueAndValidity();

    if (helperForm.valid) {
      if (value) {
        formControl.setValue([...formControl.value, value]);
      }

      formControl.updateValueAndValidity();

      if (input) {
        input.value = '';
      }
    } else {
      formControl.setErrors({ email: true });
    }
  }

  public removeEmailAddress(selectedEmail: string): void {
    const formControl: AbstractControl = this.oldForm.get('email');
    const value: string[] = formControl.value.filter(
      (email: string) => email !== selectedEmail
    );
    formControl.setValue(value);
    formControl.updateValueAndValidity();
  }
}
