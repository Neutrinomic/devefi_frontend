export const idlFactory = ({ IDL }) => {
  const RootInitArg = IDL.Record({
    'ICP_ledger_id' : IDL.Principal,
    'DEFI_AGGREGATOR' : IDL.Principal,
    'NTN_ledger_id' : IDL.Principal,
  });
  const ProdInitArg = IDL.Record({
    'RIGHT_ledger' : IDL.Principal,
    'LEFT_ledger' : IDL.Principal,
    'LEFT_aggr_id' : IDL.Nat,
    'RIGHT_aggr_id' : IDL.Nat,
  });
  const CanisterInfo = IDL.Record({
    'last_upgrade' : IDL.Int,
    'version' : IDL.Nat64,
    'cycles' : IDL.Nat,
  });
  const Pair = IDL.Record({
    'canister_id' : IDL.Principal,
    'init_args' : ProdInitArg,
  });
  const Root = IDL.Service({
    'add_pair' : IDL.Func([ProdInitArg], [], []),
    'canister_info' : IDL.Func([], [CanisterInfo], ['query']),
    'list_pairs' : IDL.Func([], [IDL.Vec(Pair)], ['query']),
    'show_log' : IDL.Func([], [IDL.Vec(IDL.Opt(IDL.Text))], ['query']),
  });
  return Root;
};
export const init = ({ IDL }) => {
  const RootInitArg = IDL.Record({
    'ICP_ledger_id' : IDL.Principal,
    'DEFI_AGGREGATOR' : IDL.Principal,
    'NTN_ledger_id' : IDL.Principal,
  });
  return [IDL.Opt(RootInitArg)];
};
