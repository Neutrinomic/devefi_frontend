/* global BigInt */

import { createSlice } from '@reduxjs/toolkit';
import {getBlast} from '../icblast.js';
import { toState } from '@infu/icblast';
import {ledgers} from "../ledgers_cfg"

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
  if (!blast.logged) return;
    let balances = Object.assign({}, ...(await Promise.all(Object.keys(ledgers).map(async symbol => {
        let balance = await blast.ledgers[symbol].icrc1_balance_of({owner: blast.me});
        return {[symbol]: Number(balance) / 10 ** ledgers[symbol].decimals};
    }))));

    dispatch(setBalances({balances}));

};


export const sendTokens = ({symbol, to, amount}) => async dispatch => {

  let blast = getBlast();
  let ledger = blast.ledgers[ symbol ];
  let amountNat = BigInt(Math.floor(amount * 10 ** ledgers[symbol].decimals));
  let fee = BigInt(ledgers[symbol].fee);
  return await ledger.icrc1_transfer({to, amount: amountNat - fee});
  
};


export const sendTokensICP = ({symbol, to, amount}) => async dispatch => {
  try {
  let blast = getBlast();
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
  let to = {owner: blast.me};
  let amountNat = BigInt(Math.floor(amount * 10 ** ledgers[symbol].decimals));

  await blast.dfv.withdraw_vector({id, to, amount:amountNat, location});


}

export default accountSlice.reducer;
