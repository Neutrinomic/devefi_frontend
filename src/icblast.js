/* global BigInt */

import { InternetIdentity } from "@infu/icblast";
import icblast, { toState } from '@infu/icblast';
import { useState, useEffect } from 'react';
import {ledgers} from "./ledgers_cfg"
import {icrc} from "./icrc1_idl"
import {icpledger} from "./icp_idl"

await InternetIdentity.create();

const subs = {
    subscribers: [],

    subscribe(handler) {
        this.subscribers.push(handler);
        return () => {
            this.unsubscribe(handler);
        };
    },

    unsubscribe(handler) {
        this.subscribers = this.subscribers.filter(h => h !== handler);
    },

    notify(data) {
        this.subscribers.forEach(handler => handler(data));
    }
}

let glob = {
    cur : null
};

export async function refresh() {
    glob.cur = {};
    glob.cur.ic = icblast({ identity: InternetIdentity.getIdentity() })
    glob.cur.dfv = await glob.cur.ic("xgnzu-riaaa-aaaal-qc64a-cai");
    glob.cur.ledgers = {};
    for (let symbol in ledgers) {
        if (symbol == "ICP") glob.cur.ledgers[symbol] = await glob.cur.ic(ledgers[symbol].id, icpledger);
        else glob.cur.ledgers[symbol] = await glob.cur.ic(ledgers[symbol].id, icrc);
    }
    glob.cur.me = InternetIdentity.getPrincipal().toText();
    glob.cur.logged = (glob.cur.me != "2vxsx-fae");
    subs.notify(glob.cur);
}

export async function login() {
    await custom_login();
    await refresh();
}

export async function logout() {
    await InternetIdentity.logout();
    await refresh();
}

export function useBlast() {
    let [blast, setBlast] = useState(glob.cur);
    useEffect(() => {
        function handleChange(g) {
            setBlast(g);
        }

        // Subscribe to changes
        const unsubscribe = subs.subscribe(handleChange);

        // Unsubscribe when the component unmounts
        return () => unsubscribe();

    });
    return blast;
}


let custom_login = () => {
    return new Promise(async (resolve, reject) => {
        InternetIdentity.client.login({
        maxTimeToLive: BigInt(90 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        idleTimeout: 1000 * 60 * 60 * 24 * 3,
        onSuccess: async (e) => {
          resolve();
        },
        onError: reject,
      });
    });
  };


await refresh();

export function getBlast() {
    return glob.cur;
}

export default glob;