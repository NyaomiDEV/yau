# YAU - "Yet Another Updater" (previously known as `pinkpill`)

Utility to periodically check for updates via your preferred AUR helper.

## Premise

**This updater was made in Node + TypeScript as a meme.**

If you can run it, it will work fine.
However, do not expect it to be light in resource usage, given that it runs on Node.

If optimizations can be done I will be glad to make them, so that this package is viable to more and more people.

I do plan to port this to another programming language that is compiled and better at handling CPU and memory than Node is; however, for that to happen, I need to learn it first. I am trying.

Lastly DO NOT COMPLAIN about me using Node to write desktop daemons.
It is not my fault if the standard library is mature enough to make them.

Then again, I am doing this as a deliberate meme (and for personal usage, but again, it is viable for me to use Node for this kind of stuff as the impact on my PC is not there, really. If you are tight on RAM or processing power then look elsewhere for update checkers.)

## How it works

It's a simple daemon. It runs silently and it notifies you whenever updates are available.

Clicking the update button in the notification will spawn your terminal and from there you can update your system.

## Installation

You'll need `nodejs`, `yarn`, `fakeroot`, `pacman` (ofc), an AUR helper to get updates from (default is `yay`), a terminal emulator which accepts commands via the `-e` argument (default is `xterm`)

```
yarn && yarn yau
```

If someone wants to make a PKGBUILD out of this, you're welcome to do so. PR it then.

## Usage

Run `yau --extract-config` to make the utility place its configuration file.

Go edit the configuration file before running `yau`!

If you're all set, just add `yau` to your autostart list.

## Configuration

The configuration file is located at `$HOME/.config/yau/config.json`.

Configuration values are self explanatory.

```js
{
	"warmupSeconds": 30,                   /* How many seconds to wait before checking for updates the first time */
	"checkIntervalSeconds": 3600,          /* Interval between checks (in seconds) */
	"notificationDurationSeconds": 10,     /* Interval for which the notification is visible (in seconds) */
	"aurHelperBinary": "/usr/bin/yay",     /* Full path to the AUR helper binary */
	"terminalBinary": "/usr/bin/xterm",    /* Full path to the terminal emulator binary */
	"Syy": false                           /* Should the utility use -Syy when updating the database and updating the system? */
};
```

## To do

- Test all common AUR helpers with this. Currently tested are `yay` and `paru`.

## License

This project is licensed under Mozilla Public License, version 2.0.

```
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
```

## Third party licenses

This project uses `dbus-notifier` which is licensed under Mozilla Public License, version 2.0.

```
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
```

```
yarn && yarn build && yarn global add file:$PWD/dist
```
or if you're really lazy
```
Copyright (c) 2021 Cynthia K. Rey, All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software without
   specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

This project uses `dbus-next` by Andrey Sidorov and Tony Crisci, which is licensed under the MIT license.

```
This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

