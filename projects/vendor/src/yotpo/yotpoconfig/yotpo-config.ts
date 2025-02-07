/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseVendorConfig } from '../../vendor-config';
import { Injectable } from '@angular/core';
import { Config } from '@spartacus/core';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class YotpoConfig extends BaseVendorConfig {
  vendor?: {
    yotpo?: {
      appToken?: string;
    };
  };
}
