/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { normalizeHttpError } from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AsmConnector } from '../../connectors/asm.connector';
import { CustomerSearchPage } from '../../models/asm.models';
import { AsmActions } from '../actions/index';

@Injectable()
export class CustomerEffects {
  customerSearch$: Observable<AsmActions.CustomerAction> = createEffect(() =>
    this.actions$.pipe(
      ofType(AsmActions.CUSTOMER_SEARCH),
      map((action: AsmActions.CustomerSearch) => action.payload),
      switchMap((options) =>
        this.asmConnector.customerSearch(options).pipe(
          map((customerSearchResults: CustomerSearchPage) => {
            return new AsmActions.CustomerSearchSuccess(customerSearchResults);
          }),
          catchError((error) =>
            of(new AsmActions.CustomerSearchFail(normalizeHttpError(error)))
          )
        )
      )
    )
  );

  constructor(private actions$: Actions, private asmConnector: AsmConnector) {}
}
