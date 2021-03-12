#!/usr/bin/env node

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Notifier from "dbus-notifier";
import UpdateChecker from "./update_checker";
import Config from "./config";
import { name } from "../package.json";
import { Variant } from "dbus-next";
import { basename } from "path";
import { status } from "./status";
import { isDeepStrictEqual } from "util";
import { snooze, snoozeoff, update, list } from "./events";
import Instance from "./instance";

let notifier: Notifier;

export async function sendNotification() {
	console.log("[!] Sending notification!");

	status.lastNotificationID = await notifier.notify({
		appName: name,
		replacesId: status.lastNotificationID,
		icon: "update-low",
		summary: "Updates available!",
		body: `<b>${status.lastUpdatablePackages.length}</b> package${status.lastUpdatablePackages.length > 1 ? "s" : ""} can be updated.`,
		actions: (status.capabilities.includes("actions")
			? [
					{
						name: "Snooze",
						key: "snooze"
					},
					{
						name: "List packages",
						key: "list"
					},
					{
						name: "Update",
						key: "update"
					}
				]
			: []
		)
		,
		hints: {
			"urgency": new Variant("y", 1),
			"category": new Variant("s", "device"),
			"desktop-entry": new Variant("s", name),
			"x-kde-origin-name": new Variant("s", basename(Config.getInstance().aurHelperBinary)),
			"x-kde-display-appname": new Variant("s", "Software updates")
		},
		timeout: 1000 * Config.getInstance().notificationDurationSeconds
	});

	console.log(`[!] Update notification sent with ID: ${status.lastNotificationID}`);
}

async function daemon(): Promise<void>{
	notifier = await Notifier.new();
	status.capabilities = await notifier.getCapabilities();

	if(status.capabilities.includes("actions")){
		notifier.on("action-invoked", async (signal) => {
			switch (signal.actionKey) {
				case "update":
					update();
					break;
				case "list":
					list();
					break;
				case "snooze":
					await snooze(notifier);
					break;
				case "snoozeoff":
					await snoozeoff(notifier);
					break;
			}
		});
	}

	instance.on("second-instance", argv => {
		if(argv.now){
			console.log("[!] Manual check was triggered");
			tickWrapper(argv.force);
		}

		switch(argv.snooze){
			case true:
			case "true":
			case "on":
				snooze(notifier);
				break;
			case false:
			case "false":
			case "off":
				snoozeoff(notifier);
				break;
		}

		if(argv.list)
			list();

		if(argv.update)
			update();
	});

	console.log("[!] Warming up...");
	setTimeout(() => {
		tickWrapper();
		setInterval(tickWrapper, 1000 * Config.getInstance().checkIntervalSeconds);
	},
	!argv.warmup ? 0 : 1000 * Config.getInstance().warmupSeconds);
}

async function tickWrapper(forceNotification = false){
	await tick(forceNotification);
	status.isTicking = false;
}

async function tick(forceNotification): Promise<void>{
	if(status.isTicking) return;

	console.log("[!] Tick!");
	status.isTicking = true;

	if(status.snooze) return;

	await UpdateChecker.updateDatabase();
	const updatablePackages = await UpdateChecker.checkPackages();

	if(updatablePackages.length > 0){
		console.log(`[!] Found ${updatablePackages.length} updates!`);
		updatablePackages.forEach(element => 
			console.log(`[=] '${element.name}' updatable from version ${element.from} to version ${element.to}`)
		);

		if(Config.getInstance().discardSameUpdatesNotification && isDeepStrictEqual(status.lastUpdatablePackages, updatablePackages) && !forceNotification)
			return;

		status.lastUpdatablePackages = updatablePackages;

		await sendNotification();
	}else
		console.log("[!] No updates found");
	
}

async function off(){
	await instance.releaseLock();
	process.exit(0);
}

process.title = name;
process.on("SIGINT", off);
process.on("SIGTERM", off);

const argv = yargs(hideBin(process.argv)).argv;

if(argv["extract-config"]){
	Config.getInstance();
	console.log(`[!] Configurations are now available (or updated) at $HOME/.config/${name}/config.json`);
	process.exit();
}

const instance = new Instance();
instance.requestLock().then(result => {
	if(result)
		daemon();
	else
		console.log("Supported arguments sent to running instance.");
});


