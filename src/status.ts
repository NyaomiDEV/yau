/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UpdatablePackage } from "./update_checker/util";

export const status = {
	capabilities: [] as string[],
	snooze: false,
	// eslint-disable-next-line no-undef
	snoozeTimeout: undefined as undefined | NodeJS.Timeout,
	lastUpdatablePackages: [] as UpdatablePackage[],
	lastNotificationID: 0,
	lastSnoozeNotificationID: 0
};