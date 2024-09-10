import { fetchBalances} from "./account"
import { fetchUserVectors, fetchFactories } from "./nodes"

import {store} from "../store"

setInterval(() => {
    store.dispatch(fetchBalances());
}, 5000)

setInterval(async () => {
    await store.dispatch(fetchFactories());
    store.dispatch(fetchFactories());
}, 60000);

store.dispatch(fetchBalances());
await store.dispatch(fetchFactories());
store.dispatch(fetchUserVectors());