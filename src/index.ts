#!/usr/bin/env node

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Notifier from "./notifier";
import UpdateChecker from "./update_checker";
import Config from "./config";
import { name } from "../package.json";
import { Variant } from "dbus-next";
import { basename } from "path";
import { UpdatablePackage } from "./update_checker/util";
import { isDeepStrictEqual } from "util";

let notifier: Notifier;

let status = {
	capabilities: [] as string[],
	snooze: false,
	// eslint-disable-next-line no-undef
	snoozeTimeout: undefined as undefined | NodeJS.Timeout,
	lastUpdatablePackages: [] as UpdatablePackage[],
	lastNotificationID: 0
};

process.title = name;

async function daemon(): Promise<void>{
	notifier = await Notifier.new();
	status.capabilities = await notifier.getCapabilities();

	if(status.capabilities.includes("actions")){
		notifier.on("action-invoked", async (signal) => {
			switch (signal.actionKey) {
				case "update":
					console.log("[!] Update action received");
					UpdateChecker.update();
					break;
				case "snooze":
					console.log("[!] Snooze action received");
					status.snooze = true;
					status.snoozeTimeout = setTimeout(() => { status.snooze = false; }, 1000 * Config.getInstance().snoozeDurationSeconds);
					console.log("[!] Sending notification!");
					status.lastNotificationID = await notifier.notify({
						appName: "pinkpill",
						replacesId: status.lastNotificationID,
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
							"desktop-entry": new Variant("s", "pinkpill"),
							"x-kde-display-appname": new Variant("s", "Software updates")
						},
						timeout: 1000 * Config.getInstance().notificationDurationSeconds
					});
					break;
				case "snoozeoff":
					console.log("[!] Snooze off action received");
					if(typeof status.snoozeTimeout !== "undefined")
						clearTimeout(status.snoozeTimeout);
					delete status.snoozeTimeout;
					status.snooze = false;
					console.log("[!] Sending notification!");
					status.lastNotificationID = await notifier.notify({
						appName: "pinkpill",
						replacesId: status.lastNotificationID,
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
							"desktop-entry": new Variant("s", "pinkpill"),
							"x-kde-display-appname": new Variant("s", "Software updates")
						},
						timeout: 1000 * Config.getInstance().notificationDurationSeconds
					});
					break;
			}
		});
	}

	console.log("[!] Warming up...");
	setTimeout(() => {
		tick();
		setInterval(tick, 1000 * Config.getInstance().checkIntervalSeconds);
	},
	1000 * Config.getInstance().warmupSeconds);
}

async function tick(): Promise<void>{
	console.log("[!] Tick!");

	if(status.snooze) return;

	await UpdateChecker.updateDatabase();
	const updatablePackages = await UpdateChecker.checkPackages();

	if(updatablePackages.length > 0){
		console.log(`[!] Found ${updatablePackages.length} updates!`);
		updatablePackages.forEach(element => 
			console.log(`[=] '${element.name}' updatable from version ${element.from} to version ${element.to}`)
		);

		if(Config.getInstance().discardSameUpdatesNotification && isDeepStrictEqual(status.lastUpdatablePackages, updatablePackages))
			return;
		
		console.log("[!] Sending notification!");
		status.lastNotificationID = await notifier.notify({
			appName: "pinkpill",
			replacesId: status.lastNotificationID,
			icon: "update-low",
			summary: "Updates available!",
			body: `<b>${updatablePackages.length}</b> package${updatablePackages.length > 1 ? "s" : ""} can be updated.`,
			actions: (status.capabilities.includes("actions")
				?   [
						{
							name: "Snooze",
							key: "snooze"
						},
						{
							name: "Update",
							key: "update"
						}
					]
				:   []
			)
			,
			hints: {
				"urgency": new Variant("y", 1),
				"category": new Variant("s", "device"),
				"desktop-entry": new Variant("s", "pinkpill"),
				"x-kde-origin-name": new Variant("s", basename(Config.getInstance().aurHelperBinary)),
				"x-kde-display-appname": new Variant("s", "Software updates")
			},
			timeout: 1000 * Config.getInstance().notificationDurationSeconds
		});

		status.lastUpdatablePackages = updatablePackages;
		console.log(`[!] Update notification sent with ID: ${status.lastNotificationID}`);
	}else
		console.log("[!] No updates found");
	
}


const argv = yargs(hideBin(process.argv)).argv;

if(argv["extract-config"]){
	Config.getInstance();
	console.log(`[!] Configurations are now available (or updated) at $HOME/.config/${name}/config.json`);
	process.exit();
}

daemon();
