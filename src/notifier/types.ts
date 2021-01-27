/* eslint-disable no-unused-vars */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import dbus from "dbus-next";

// -------- METHOD TYPES (in and out)

export type Notification = {
	appName: string,
	replacesId: number,
	icon: string,
	summary: string,
	body: string,
	actions: NotificationAction[],
	hints: NotificationHints,
	timeout: number
}

export type NotificationAction = {
	key: string,
	name: string
}

export type NotificationHints = {
	[any: string]: dbus.Variant
}

export type ServerInformation = {
	name: string,
	vendor: string,
	version: string,
	specVersion: string
}

// ------- SIGNAL TYPES

export type ActionInvokedSignal = {
	id: number,
	actionKey: string
}

export type NotificationRepliedSignal = {
	id: number,
	reply: string
}

export type NotificationClosedSignal = {
	id: number,
	reason: NotificationClosedReason
}

export enum NotificationClosedReason {
	EXPIRED = 1,
	DISMISSED_BY_USER = 2,
	CLOSED_BY_PROGRAM = 3,
	UNDEFINED_OR_RESERVED_REASON = 4
}
