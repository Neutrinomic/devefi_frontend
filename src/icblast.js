/* global BigInt */

import { InternetIdentity } from "@infu/icblast";
import icblast, { toState } from '@infu/icblast';
import { useState, useEffect } from 'react';
import {icrc} from "./icrc1_idl"
import {icpledger} from "./icp_idl"
import {idlFactory as vectordid} from "./main.idl"
import {idlFactory as aggregatordid} from "./aggregator"
import {idlFactory as rootdid} from "./root.idl"
import {Principal} from "@dfinity/principal";

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
    glob.cur.root = await glob.cur.ic("wxer6-3yaaa-aaaal-qjnua-cai", rootdid);
    glob.cur.prices = await glob.cur.ic("u45jl-liaaa-aaaam-abppa-cai", aggregatordid);

    // Get tokens from the aggregator
    let tokens = await glob.cur.prices.get_config();

    // Get pairs from root
    let pairs = toState(await glob.cur.root.list_pairs());

    let pools = {};
    let used = [];
    let oracles_used = {};
    for (let pair of pairs) {
        let {LEFT_aggr_id, LEFT_ledger, RIGHT_aggr_id, RIGHT_ledger} = pair.init_args;
        let Lsymbol_ledger = tokens.tokens.find(t => t.ledger?.icrc1?.ledger == LEFT_ledger).symbol;
        let Rsymbol_ledger = tokens.tokens.find(t => t.ledger?.icrc1?.ledger == RIGHT_ledger).symbol;
        let Lsymbol_oracle = tokens.tokens[LEFT_aggr_id].symbol;
        let Rsymbol_oracle = tokens.tokens[RIGHT_aggr_id].symbol;
        oracles_used[Lsymbol_ledger] = Lsymbol_oracle;
        oracles_used[Rsymbol_ledger] = Rsymbol_oracle;
        used.push(Lsymbol_ledger);
        used.push(Rsymbol_ledger);
        pools[Lsymbol_ledger + "_" + Rsymbol_ledger] = pair.canister_id;
    }
    
    // Derive used tokens from aggregator and pairs
    let ledgers = {}
    let t = tokens.tokens;
    for (let i = 0; i < t.length; i++) {
        if (t[i].deleted) continue;
        if (ledgers[t[i].symbol]) continue;
        if (!(t[i].ledger?.icrc1?.ledger)) continue;
        if (!used.includes(t[i].symbol)) continue;
        ledgers[t[i].symbol] = {
            decimals: Number(t[i].decimals),
            id : t[i].ledger.icrc1.ledger.toText(),
            name: t[i].name,
            vectors: true,
            priceid : i,
            oracle: oracles_used[t[i].symbol]
        }
    };
    
    glob.cur.meta = {
        ledgers, pools
    }
    // console.log(ledgers)
    // console.log(pools)

    glob.cur.ledgers = {};
    glob.cur.pools = {};
    glob.cur.poolsId = {};
    for (let pp in pools) {
        glob.cur.pools[pp] = await glob.cur.ic(pools[pp], vectordid);
        glob.cur.poolsId = pools[pp];
    }
    for (let symbol in ledgers) {
        if (symbol == "ICP") glob.cur.ledgers[symbol] = await glob.cur.ic(ledgers[symbol].id, icpledger);
        else glob.cur.ledgers[symbol] = await glob.cur.ic(ledgers[symbol].id, icrc);
    }

    // console.log(glob.cur.ledgers);
    glob.cur.me = InternetIdentity.getPrincipal().toText();
    glob.cur.logged = (glob.cur.me != "2vxsx-fae");

   


    // Fetch ledger fees
    await Promise.all(Object.keys(glob.cur.ledgers).map(async (symbol) => {
        glob.cur.meta.ledgers[symbol].fee = Number(await glob.cur.ledgers[symbol].icrc1_fee());
    }));

    // console.log(glob.cur.meta.ledgers)

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