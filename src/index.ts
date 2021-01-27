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

let notifier: Notifier;

async function daemon(): Promise<void>{
	notifier = await Notifier.new();

	notifier.on("action-invoked", (signal) => {
		switch(signal.actionKey){
			case "update":
				console.log("[!] Update action received");
				UpdateChecker.update();
				break;
		}
	});

	tick();
	setInterval(tick, 1000 * Config.getInstance().checkIntervalSeconds);
}

async function tick(): Promise<void>{
	console.log("[!] Tick!");
	if(Config.getInstance().updateDatabase)
		await UpdateChecker.updateDatabase();
	let updatablePackages = await UpdateChecker.checkPackages();

	if(updatablePackages.length > 0){
		console.log(`[!] Found ${updatablePackages.length} updates!`);
		updatablePackages.forEach(element => 
			console.log(`[=] '${element.name}' updatable from version ${element.from} to version ${element.to}`)
		);
		console.log("[!] Sending notification!");
		let id = await notifier.notify({
			appName: "Software updates",
			replacesId: 0,
			icon: "update-low",
			summary: "Updates available!",
			body: `${updatablePackages.length} packages can be updated.`,
			actions: [{
				name: "Update",
				key: "update"
			}],
			hints: {},
			timeout: 1000 * Config.getInstance().notificationDurationSeconds
		});
		console.log(`[!] Update notification sent with ID: ${id}`);
	}else
		console.log("[!] No updates found");
	
}


const argv = yargs(hideBin(process.argv)).argv;

if(argv["extract-config"]){
	Config.getInstance();
	console.log("[!] Configurations are now available (or updated) at $HOME/.config/pinkpill/config.json");
	process.exit();
}

daemon();