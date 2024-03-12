import { fetchBalances} from "./account"
import {store} from "../store"

setInterval(() => {
    store.dispatch(fetchBalances());
}, 5000)

store.dispatch(fetchBalances());