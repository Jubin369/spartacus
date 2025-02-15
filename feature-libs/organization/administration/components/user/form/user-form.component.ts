/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { B2BUser, B2BUserRole, Title } from '@spartacus/core';
import {
  B2BUnitNode,
  B2BUserService,
  OrgUnitService,
} from '@spartacus/organization/administration/core';
import { UserProfileFacade } from '@spartacus/user/profile/root';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CurrentItemService } from '../../shared/current-item.service';
import { ItemService } from '../../shared/item.service';
import { CurrentUserService } from '../services/current-user.service';
import { UserItemService } from '../services/user-item.service';

@Component({
  selector: 'cx-org-user-form',
  templateUrl: './user-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'content-wrapper' },
  providers: [
    {
      provide: ItemService,
      useExisting: UserItemService,
    },
    {
      provide: CurrentItemService,
      useExisting: CurrentUserService,
    },
  ],
})
export class UserFormComponent implements OnInit {
  form: FormGroup | null = this.itemService.getForm();

  /**
   * Initialize the business unit for the user.
   *
   * If there's a unit provided, we disable the unit form control.
   */
  @Input() set unitKey(value: string | null) {
    if (value) {
      this.form?.get('orgUnit.uid')?.setValue(value);
      this.form?.get('orgUnit')?.disable();
    }
  }

  units$: Observable<B2BUnitNode[] | undefined> = this.unitService
    .getActiveUnitList()
    .pipe(
      tap((units) => {
        if (units && units.length === 1) {
          this.form?.get('orgUnit.uid')?.setValue(units[0]?.id);
        }
      })
    );

  titles$: Observable<Title[]> = this.userProfileFacade.getTitles();

  availableRoles: B2BUserRole[] = this.b2bUserService.getAllRoles();

  constructor(
    protected itemService: ItemService<B2BUser>,
    protected unitService: OrgUnitService,
    protected userProfileFacade: UserProfileFacade,
    protected b2bUserService: B2BUserService
  ) {}

  ngOnInit(): void {
    this.unitService.loadList();
  }

  updateRoles(event: MouseEvent) {
    const { checked, value } = event.target as HTMLInputElement;
    if (checked) {
      this.roles.push(new FormControl(value));
    } else {
      this.roles.removeAt(this.roles.value.indexOf(value));
    }
  }

  get roles(): FormArray {
    return this.form?.get('roles') as FormArray;
  }

  get isAssignedToApprovers(): FormControl {
    return this.form?.get('isAssignedToApprovers') as FormControl;
  }
}
