/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChildProcessWithoutNullStreams, spawn } from "child_process";

export type UpdatablePackage = {
	name: string,
	from: string,
	to: string
}

export function parseQuOutput(output: string): UpdatablePackage[]{
	let _out: UpdatablePackage[] = [];
	for (let str of output.trim().split("\n").filter(Boolean)){
		const _package = str.split(" -> ").join(" ").split(" ");
		_out.push({
			name: _package[0],
			from: _package[1],
			to: _package[2]
		});
	}

	return _out;
}

export function executeInTerminal(terminalPath: string, command: string, args: readonly string[]): ChildProcessWithoutNullStreams{
	return spawn(
		terminalPath,
		["-e", command, ...args]
	);
}

export function getConfFromPacman(conf: string): Promise<string> {
	return new Promise(resolve => {
		const c = spawn(
			"pacman-conf",
			[conf]
		);

		let data = Buffer.alloc(0);
		c.stdout.on("data", chk => data = Buffer.concat([data, chk]));
		c.on("close", () => resolve(data.toString().trim()));
	});
}