/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type {
	NotificationClosedReason,
	NotificationAction,
	Notification,
	ServerInformation,
	NotificationClosedSignal,
	ActionInvokedSignal,
	NotificationRepliedSignal,
} from "./types";
import dbus from "dbus-next";
import TypedEventEmitter from "./typed_emitter";

type Events = {
	// eslint-disable-next-line no-unused-vars
	"notification-closed": (signal: NotificationClosedSignal) => void,
	// eslint-disable-next-line no-unused-vars
	"notification-replied": (signal: NotificationRepliedSignal) => void,
	// eslint-disable-next-line no-unused-vars
	"action-invoked": (signal: ActionInvokedSignal) => void
}

export default class Notifier extends TypedEventEmitter<Events> {

	private iface: dbus.ClientInterface;

	private constructor(proxyObject: dbus.ProxyObject){
		super();
		this.iface = proxyObject.getInterface("org.freedesktop.Notifications");

		this.iface.on(
			"NotificationClosed",
			(id: number, reason: NotificationClosedReason) => 
				this.emit("notification-closed", {
					id: id,
					reason: reason
				})
		);

		this.iface.on(
			"NotificationReplied",
			(id, reply) => 
				this.emit("notification-replied", {
					id: id,
					reply: reply
				})
		);

		this.iface.on(
			"ActionInvoked",
			(id: number, actionKey: string) =>
				this.emit("action-invoked", {
					id: id,
					actionKey: actionKey
				})
		);
	}

	public static async new(): Promise<Notifier>{
		return new Notifier(await dbus.sessionBus().getProxyObject("org.freedesktop.Notifications", "/org/freedesktop/Notifications"));
	}

	// --------------------------- METHODS

	public getCapabilities(): Promise<string[]>{
		return this.iface.GetCapabilities(); // async
	}

	public async getServerInformation(): Promise<ServerInformation>{
		const a = await this.iface.GetServerInformation(); // async
		return {
			name: a[0],
			vendor: a[1],
			version: a[2],
			specVersion: a[3]
		};
	}

	public notify(notification: Notification): Promise<number>{
		return this.iface.Notify( // is async and returns a promise
			notification.appName,
			notification.replacesId,
			notification.icon,
			notification.summary,
			notification.body,
			Notifier._formatActions(notification.actions),
			notification.hints,
			notification.timeout
		);
	}

	public closeNotification(id: number): Promise<void>{
		return this.iface.CloseNotification(id); // async
	}

	public dispose(){
		this.iface.removeAllListeners();
		this.removeAllListeners();
	}

	// --------------------- UTILS

	private static _formatActions(actions: NotificationAction[]): string[]{
		let a: string[] = [];
		for(let action of actions)
			a.push(action.key, action.name);
		
		return a;
	}

	public static kvToNotifyActions(kv: {[any: string]: string}): NotificationAction[]{
		let a: NotificationAction[] = [];
		for(let key in kv){
			a.push({
				key: key,
				name: kv[key]
			});
		}
		return a;
	}

}