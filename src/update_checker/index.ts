/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { spawn } from "child_process";
import Config from "../config";
import { executeInTerminal, getConfFromPacman, parseQuOutput, UpdatablePackage } from "./util";
import * as path from "path";
import { promises as fs } from "fs";
import { userInfo } from "os";
import { name } from "../../package.json";

export const DBPath = path.resolve("/", "tmp", name + "DB-" + userInfo().uid);

export default class UpdateChecker {

	public static update(): void{
		console.log(`[!] Calling ${Config.getInstance().aurHelperBinary} ${Config.getInstance().Syy ? "-Syyu" : "-Syu"} in terminal ${Config.getInstance().terminalBinary}`);
		executeInTerminal(Config.getInstance().terminalBinary, Config.getInstance().aurHelperBinary, [Config.getInstance().Syy ? "-Syyu" : "-Syu"]);
	}

	public static listPackagesInTerminal(packages: UpdatablePackage[]): Promise<number | null>{
		let str = "Updatable packages\n\n";
		for(const pack of packages)
			str += `${pack.name}\nCurrent version: ${pack.from}\nUpdatable to version: ${pack.to}\n\n`;
		
		let terminalInstance = executeInTerminal(Config.getInstance().terminalBinary, "sh", ["-c", `echo "${str.split("\"").join("\\\"")}" | less`]);
		return new Promise(resolve => terminalInstance.on("close", (code) => resolve(code)));
	}

	public static async updateDatabase(): Promise<void>{ // This one will always only update Pacman's DB
		console.log(`[!] Ensuring temporary Pacman database path '${DBPath}'`);
		await fs.stat(DBPath).catch(() => fs.mkdir(DBPath, { recursive: true }));
		await fs.stat(path.resolve(DBPath, "local")).catch(async () => fs.symlink(path.resolve(await getConfFromPacman("DBPath"), "local"), path.resolve(DBPath, "local")));

		return new Promise(resolve => {
			console.log(`[!] Calling fakeroot -- pacman -Sy --dbpath ${DBPath}`);
			let child = spawn(
				"fakeroot",
				["--", "pacman", "-Sy", "--dbpath", DBPath]
			);

			child.stdout.on("data", chunk => process.stdout.write(chunk));

			child.on("close", () => resolve());
		});
	}

	public static checkPackages(): Promise<UpdatablePackage[]>{
		console.log(`[!] Calling ${Config.getInstance().aurHelperBinary} -Qu`);
		return new Promise(resolve => {
			let child = spawn(
				Config.getInstance().aurHelperBinary,
				["-Qu", "--dbpath", DBPath]
			);

			let buf = Buffer.alloc(0);

			child.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk]));
			child.on("close", () => resolve(parseQuOutput(buf.toString())));
		});
	}
}