/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { ModalDirective } from './modal.directive';

@NgModule({
  declarations: [ModalDirective],
  exports: [ModalDirective],
})
export class ModalModule {}
