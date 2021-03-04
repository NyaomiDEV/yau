/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Notifier from "dbus-notifier";
import { Variant } from "dbus-next";
import Config from "./config";
import { status } from "./status";
import UpdateChecker from "./update_checker";
import { name } from "../package.json";
import { sendNotification } from ".";

export function update(){
	console.log("[!] Update action received");
	UpdateChecker.update();
}

export async function snooze(notifier: Notifier){
	console.log("[!] Snooze action received");
	status.snooze = true;
	status.snoozeTimeout = setTimeout(() => { status.snooze = false; }, 1000 * Config.getInstance().snoozeDurationSeconds);
	console.log("[!] Sending notification!");
	status.lastSnoozeNotificationID = await notifier.notify({
		appName: name,
		replacesId: 0,
		icon: "notifications-disabled",
		summary: "Snoozed",
		body: `Update notifications won't be sent for the next ${Config.getInstance().snoozeDurationSeconds} seconds.`,
		actions: (status.capabilities.includes("actions")
			? [
					{
						name: "Snooze off",
						key: "snoozeoff"
					}
				]
			: []
		)
		,
		hints: {
			"urgency": new Variant("y", 1),
			"category": new Variant("s", "device"),
			"desktop-entry": new Variant("s", name),
			"x-kde-display-appname": new Variant("s", "Software updates")
		},
		timeout: 1000 * Config.getInstance().notificationDurationSeconds
	});
}

export async function snoozeoff(notifier: Notifier){
	console.log("[!] Snooze off action received");
	if (typeof status.snoozeTimeout !== "undefined")
		clearTimeout(status.snoozeTimeout);
	delete status.snoozeTimeout;
	status.snooze = false;
	console.log("[!] Sending notification!");
	status.lastSnoozeNotificationID = await notifier.notify({
		appName: name,
		replacesId: 0,
		icon: "notifications",
		summary: "Notifications are enabled again",
		body: "You will receive update notifications from the next scheduled check onwards.",
		actions: (status.capabilities.includes("actions")
			? [
					{
						name: "Snooze",
						key: "snooze"
					}
				]
			: []
		)
		,
		hints: {
			"urgency": new Variant("y", 1),
			"category": new Variant("s", "device"),
			"desktop-entry": new Variant("s", name),
			"x-kde-display-appname": new Variant("s", "Software updates")
		},
		timeout: 1000 * Config.getInstance().notificationDurationSeconds
	});
}

export async function list(){
	console.log("[!] List action received");

	await UpdateChecker.listPackagesInTerminal(status.lastUpdatablePackages);

	console.log("[!] Resending notification");

	await sendNotification();
}