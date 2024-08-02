/* global BigInt */

import { createSlice } from '@reduxjs/toolkit';
import {getBlast} from '../icblast.js';
import { toState } from '@infu/icblast';

const initialState = {
  balances : {}
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setBalances: (state, action) => {
      state.balances = action.payload.balances;
    },
   
  },
});

// Action creators are generated for each case reducer function
export const { setBalances } = accountSlice.actions;

export const fetchBalances = () => async dispatch => {
  let blast = getBlast();
  const ledgers = blast.meta.ledgers;

  if (!blast.logged) return;
    let balances = Object.assign({}, ...(await Promise.all(Object.keys(ledgers).map(async symbol => {
        let balance = await blast.ledgers[symbol].icrc1_balance_of({owner: blast.me});
        return {[symbol]: Number(balance) / 10 ** ledgers[symbol].decimals};
    }))));

    dispatch(setBalances({balances}));

};


export const sendTokens = ({symbol, to, amount}) => async dispatch => {

  let blast = getBlast();
  const ledgers = blast.meta.ledgers;

  let ledger = blast.ledgers[ symbol ];
  let amountNat = BigInt(Math.floor(amount * 10 ** ledgers[symbol].decimals));
  let fee = BigInt(ledgers[symbol].fee);
  return await ledger.icrc1_transfer({to, amount: amountNat - fee});
  
};

export const approveTokens = ({symbol, amount, spender}) => async dispatch => {
  let blast = getBlast();
  const ledgers = blast.meta.ledgers;

  let ledger = blast.ledgers[ symbol ];
  let amountNat = BigInt(Math.floor(amount * 10 ** ledgers[symbol].decimals));
  let fee = BigInt(ledgers[symbol].fee);
  return await ledger.icrc2_approve({amount: amountNat - fee, spender});
  
};


export const sendTokensICP = ({symbol, to, amount}) => async dispatch => {
  try {
  let blast = getBlast();
  const ledgers = blast.meta.ledgers;

  let ledger = blast.ledgers[ symbol ];
  let amountNat = BigInt(Math.floor(amount * 10 ** ledgers[symbol].decimals));
  let fee = BigInt(ledgers[symbol].fee);
  return await ledger.transfer({to, amount:{e8s: amountNat - fee}, memo:0, fee: {e8s: fee}});
  } catch (e) {
    console.log(e)
  }
};


export const withdrawVector = ({id, symbol, location, amount}) => async dispatch => {

  let blast = getBlast();
  const ledgers = blast.meta.ledgers;

  let to = {owner: blast.me};
  let amountNat = BigInt(Math.floor(amount * 10 ** ledgers[symbol].decimals));

  let [poolid, vid] = id.split(".");

  vid = parseInt(vid, 10);
  
  let [source, destination] = poolid.split("_");
  let pool = blast.pools[`${source}_${destination}`] || blast.pools[`${destination}_${source}`];
  if (!pool) throw new Error("Pool not found");

  console.log({poolid, vid})
  await pool.withdraw_vector({id:vid, to, amount:amountNat, location});

}

export default accountSlice.reducer;
