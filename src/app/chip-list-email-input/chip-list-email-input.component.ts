import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  Optional,
  Self,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-chip-list-email-input',
  templateUrl: './chip-list-email-input.component.html',
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: ChipListEmailInputComponent
    }
  ]
})
export class ChipListEmailInputComponent
  implements
    ControlValueAccessor,
    MatFormFieldControl<string[]>,
    DoCheck,
    OnDestroy {
  private static nextId: number = 0;
  private _placeholder: string = null;
  private _required: boolean = false;
  private _disabled: boolean = false;
  public _value: string[] = null;
  public focused: boolean = false;
  public errorState: boolean = false;
  public stateChanges: Subject<void> = new Subject<void>();
  public emailInputValue: string = '';
  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  get empty(): boolean {
    return Array.isArray(this.value) ? this.value.length === 0 : !this.value;
  }

  @Input()
  get value(): string[] {
    return this._value;
  }
  set value(value: string[]) {
    this._value = value;
    this.handleOnChange(value);
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(required: boolean) {
    this._required = !!required;
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = !!value;
    this.stateChanges.next();
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }

  @Input() public maxValueLength: number = 15;

  @HostBinding()
  public id: string = `app-chiplist-input-${ChipListEmailInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby') public describedBy: string = '';

  @HostBinding('class.floating') get shouldLabelFloat(): boolean {
    return this.focused || !this.empty || !!this.emailInputValue;
  }

  @ViewChild('emailInputControl') public emailInputControl: NgControl;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private focusMonitor: FocusMonitor,
    private elementRef: ElementRef<HTMLElement>
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }

    this.focusMonitor
      .monitor(this.elementRef.nativeElement, true)
      .subscribe((origin: FocusOrigin) => {
        this.focused = !!origin;
        this.stateChanges.next();
      });
  }

  public ngOnDestroy(): void {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
  }

  public handleOnChange: (v: any) => void = (v: any) => {
    return;
  };
  public handleOnTouched: () => void = () => {
    return;
  };

  public writeValue(value: any): void {
    this.value = Array.isArray(value) ? value : null;
  }

  public registerOnChange(fn: (v: any) => void): void {
    this.handleOnChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.handleOnTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      const matChipInput: HTMLElement = this.elementRef.nativeElement.querySelector(
        'input'
      );

      if (matChipInput) {
        matChipInput.focus();
      }
    }
  }

  public setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  public ngDoCheck(): void {
    if (this.ngControl) {
      this.errorState = this.ngControl.invalid && this.ngControl.touched;
      this.stateChanges.next();
    }
  }

  public add(event: MatChipInputEvent): void {
    const input: HTMLInputElement = event.input;
    const value: string = event.value ? event.value.trim() : event.value;

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setErrors(null);
      this.ngControl.control.updateValueAndValidity();
    }

    if (this.emailInputControl.valid) {
      if (value) {
        const fieldValue: string[] = this.value ? [...this.value] : [];
        fieldValue.push(value);

        this.value = fieldValue;
      }

      if (input) {
        input.value = '';
      }
    } else if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setErrors({ email: true });
      this.ngControl.control.markAsTouched();
    }
  }

  public remove(val: string): void {
    const value: string[] = this.value ? [...this.value] : [];
    const index: number = value.indexOf(val);

    if (index >= 0) {
      value.splice(index, 1);
      this.value = value;
    }
  }
}
