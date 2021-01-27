/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { spawn } from "child_process";
import Config from "../config";
import { executeInTerminal, parseOutput, UpdatablePackage } from "./util";

export default class UpdateChecker {

	public static update(): void{
		console.log(`[!] Calling ${Config.getInstance().aurHelperBinary} ${Config.getInstance().Syy ? "-Syyu" : "-Syu"} in terminal ${Config.getInstance().terminalBinary}`);
		executeInTerminal(Config.getInstance().terminalBinary, Config.getInstance().aurHelperBinary, [Config.getInstance().Syy ? "-Syyu" : "-Syu"]);
	}

	public static updateDatabase(): Promise<void>{ // This one will always only update Pacman's DB
		console.log(`[!] Calling ${Config.getInstance().sudoBinary} ${Config.getInstance().pacmanBinary} ${Config.getInstance().Syy ? "-Syy" : "-Sy"}`);
		return new Promise(resolve => {
			let child = spawn(
				Config.getInstance().sudoBinary,
				[Config.getInstance().pacmanBinary, (Config.getInstance().Syy ? "-Syy" : "-Sy")]
			);

			child.stdout.on("data", chunk => process.stdout.write(chunk));

			child.on("close", () => {
				resolve();
			});
		});
	}

	public static checkPackages(): Promise<UpdatablePackage[]>{
		console.log(`[!] Calling ${Config.getInstance().aurHelperBinary} -Qu`);
		return new Promise(resolve => {
			let child = spawn(
				Config.getInstance().aurHelperBinary,
				["-Qu"],
				{
					stdio: "pipe"
				}
			);

			let buf = Buffer.alloc(0);

			child.stdout.on("data", chunk => {
				buf = Buffer.concat([buf, chunk]);
			});

			child.on("close", () => {
				resolve(parseOutput(buf.toString()));
			});
		});
	}
}