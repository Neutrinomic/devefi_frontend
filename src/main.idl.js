export const idlFactory = ({ IDL }) => {
  const ArchivedTransactionResponse = IDL.Rec();
  const Value = IDL.Rec();
  const InitArg = IDL.Record({
    'ICP_ledger_id' : IDL.Principal,
    'RIGHT_ledger' : IDL.Principal,
    'LEFT_ledger' : IDL.Principal,
    'LEFT_aggr_id' : IDL.Nat,
    'DEFI_AGGREGATOR' : IDL.Principal,
    'NTN_ledger_id' : IDL.Principal,
    'RIGHT_aggr_id' : IDL.Nat,
  });
  const CanisterInfo = IDL.Record({
    'last_upgrade' : IDL.Int,
    'version' : IDL.Nat64,
    'cycles' : IDL.Nat,
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const DestinationEndpointInput = IDL.Record({
    'ledger' : IDL.Principal,
    'address' : IDL.Opt(Account),
  });
  const SourceEndpointInput = IDL.Record({ 'ledger' : IDL.Principal });
  const Algo = IDL.Variant({
    'v1' : IDL.Record({
      'max' : IDL.Float64,
      'multiplier' : IDL.Float64,
      'max_tradable_usd' : IDL.Float64,
      'interval_release_usd' : IDL.Float64,
      'multiplier_wiggle_seconds' : IDL.Float64,
      'interval_seconds' : IDL.Nat32,
      'multiplier_wiggle' : IDL.Float64,
    }),
  });
  const DVectorRequest = IDL.Record({
    'destination' : DestinationEndpointInput,
    'source' : SourceEndpointInput,
    'algo' : Algo,
  });
  const DVectorId__1 = IDL.Nat32;
  const R_4 = IDL.Variant({ 'ok' : DVectorId__1, 'err' : IDL.Text });
  const DVectorId = IDL.Nat32;
  const Timestamp = IDL.Nat32;
  const Endpoint = IDL.Record({
    'ledger_symbol' : IDL.Text,
    'ledger_decimals' : IDL.Nat,
    'ledger' : IDL.Principal,
    'address' : Account,
    'ledger_fee' : IDL.Nat,
  });
  const UnconfirmedTransactionShared = IDL.Record({
    'to' : Account,
    'fee' : IDL.Nat,
    'to_id' : IDL.Opt(DVectorId),
    'tries' : IDL.Nat,
    'from' : Account,
    'memo' : IDL.Vec(IDL.Nat8),
    'from_id' : DVectorId,
    'ledger' : IDL.Principal,
    'timestamp' : Timestamp,
    'amount' : IDL.Nat,
  });
  const DVectorShared__1 = IDL.Record({
    'created' : Timestamp,
    'destination' : Endpoint,
    'source_balance' : IDL.Nat,
    'active' : IDL.Bool,
    'modified' : Timestamp,
    'destination_balance_available' : IDL.Nat,
    'source' : Endpoint,
    'owner' : IDL.Principal,
    'algo' : IDL.Opt(Algo),
    'rate' : IDL.Float64,
    'destination_rate_usd' : IDL.Float64,
    'remote_destination' : IDL.Bool,
    'source_rate_usd' : IDL.Float64,
    'source_balance_tradable_last_update' : Timestamp,
    'destination_balance' : IDL.Nat,
    'source_balance_tradable' : IDL.Nat,
    'total_events' : IDL.Nat,
    'unconfirmed_transactions' : IDL.Vec(UnconfirmedTransactionShared),
    'source_balance_available' : IDL.Nat,
  });
  const ArchVectorsResult = IDL.Record({
    'total' : IDL.Nat,
    'entries' : IDL.Vec(IDL.Tuple(DVectorId, DVectorShared__1)),
  });
  const TxId = IDL.Nat;
  const VLocation = IDL.Variant({
    'destination' : IDL.Null,
    'source' : IDL.Null,
  });
  const TxKind = IDL.Variant({
    'create_vector' : IDL.Record({
      'vid' : DVectorId,
      'owner' : IDL.Principal,
      'source_ledger' : IDL.Principal,
      'destination_ledger' : IDL.Principal,
    }),
    'withdraw' : IDL.Record({
      'to' : Account,
      'fee' : IDL.Nat,
      'from' : DVectorId,
      'vtx_id' : IDL.Nat64,
      'amount' : IDL.Nat,
      'location' : VLocation,
    }),
    'swap' : IDL.Record({
      'to' : DVectorId,
      'fee' : IDL.Nat,
      'from' : DVectorId,
      'vtx_id' : IDL.Nat64,
      'amountIn' : IDL.Nat,
      'amountOut' : IDL.Nat,
    }),
    'source_in' : IDL.Record({
      'fee' : IDL.Nat,
      'vid' : DVectorId,
      'amount' : IDL.Nat,
    }),
    'destination_out' : IDL.Record({
      'fee' : IDL.Nat,
      'vid' : DVectorId,
      'amount' : IDL.Nat,
    }),
    'source_out' : IDL.Record({
      'fee' : IDL.Nat,
      'vid' : DVectorId,
      'amount' : IDL.Nat,
    }),
    'destination_in' : IDL.Record({
      'fee' : IDL.Nat,
      'vid' : DVectorId,
      'vtx_id' : IDL.Opt(IDL.Nat64),
      'amount' : IDL.Nat,
    }),
    'tx_sent' : IDL.Record({
      'vtx_id' : IDL.Nat64,
      'error' : IDL.Bool,
      'retry' : IDL.Nat,
    }),
  });
  const Tx = IDL.Record({ 'kind' : TxKind, 'timestamp' : Timestamp });
  const HistoryResponse = IDL.Record({
    'total' : IDL.Nat,
    'entries' : IDL.Vec(IDL.Tuple(IDL.Opt(TxId), IDL.Opt(Tx))),
  });
  const R_3 = IDL.Variant({ 'ok' : HistoryResponse, 'err' : IDL.Text });
  const DVectorShared = IDL.Record({
    'created' : Timestamp,
    'destination' : Endpoint,
    'source_balance' : IDL.Nat,
    'active' : IDL.Bool,
    'modified' : Timestamp,
    'destination_balance_available' : IDL.Nat,
    'source' : Endpoint,
    'owner' : IDL.Principal,
    'algo' : IDL.Opt(Algo),
    'rate' : IDL.Float64,
    'destination_rate_usd' : IDL.Float64,
    'remote_destination' : IDL.Bool,
    'source_rate_usd' : IDL.Float64,
    'source_balance_tradable_last_update' : Timestamp,
    'destination_balance' : IDL.Nat,
    'source_balance_tradable' : IDL.Nat,
    'total_events' : IDL.Nat,
    'unconfirmed_transactions' : IDL.Vec(UnconfirmedTransactionShared),
    'source_balance_available' : IDL.Nat,
  });
  const R_2 = IDL.Variant({
    'ok' : IDL.Record({ 'icp' : IDL.Nat, 'ntn' : IDL.Nat }),
    'err' : IDL.Text,
  });
  const GetArchivesArgs = IDL.Record({ 'from' : IDL.Opt(IDL.Principal) });
  const GetArchivesResultItem = IDL.Record({
    'end' : IDL.Nat,
    'canister_id' : IDL.Principal,
    'start' : IDL.Nat,
  });
  const GetArchivesResult = IDL.Vec(GetArchivesResultItem);
  const TransactionRange = IDL.Record({
    'start' : IDL.Nat,
    'length' : IDL.Nat,
  });
  const GetBlocksArgs = IDL.Vec(TransactionRange);
  const ValueMap = IDL.Tuple(IDL.Text, Value);
  Value.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(ValueMap),
      'Nat' : IDL.Nat,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Text' : IDL.Text,
      'Array' : IDL.Vec(Value),
    })
  );
  const GetTransactionsResult = IDL.Record({
    'log_length' : IDL.Nat,
    'blocks' : IDL.Vec(
      IDL.Record({ 'id' : IDL.Nat, 'block' : IDL.Opt(Value) })
    ),
    'archived_blocks' : IDL.Vec(ArchivedTransactionResponse),
  });
  const GetTransactionsFn = IDL.Func(
      [IDL.Vec(TransactionRange)],
      [GetTransactionsResult],
      ['query'],
    );
  ArchivedTransactionResponse.fill(
    IDL.Record({
      'args' : IDL.Vec(TransactionRange),
      'callback' : GetTransactionsFn,
    })
  );
  const GetBlocksResult = IDL.Record({
    'log_length' : IDL.Nat,
    'blocks' : IDL.Vec(
      IDL.Record({ 'id' : IDL.Nat, 'block' : IDL.Opt(Value) })
    ),
    'archived_blocks' : IDL.Vec(ArchivedTransactionResponse),
  });
  const BlockType__1 = IDL.Record({
    'url' : IDL.Text,
    'block_type' : IDL.Text,
  });
  const PlatformPath = IDL.Vec(IDL.Nat8);
  const PlatformId = IDL.Nat64;
  const TokenId = IDL.Record({
    'path' : PlatformPath,
    'platform' : PlatformId,
  });
  const PairId = IDL.Record({ 'base' : TokenId, 'quote' : TokenId });
  const Level = IDL.Nat8;
  const DepthRequest = IDL.Record({ 'level' : Level, 'limit' : IDL.Nat32 });
  const PairRequest = IDL.Record({
    'pairs' : IDL.Vec(PairId),
    'depth' : IDL.Opt(DepthRequest),
  });
  const Amount = IDL.Nat;
  const Rate = IDL.Float64;
  const TokenData = IDL.Record({
    'volume24' : Amount,
    'volume_total' : Amount,
  });
  const PairData = IDL.Record({
    'id' : PairId,
    'volume_total_USD' : IDL.Opt(Amount),
    'asks' : IDL.Vec(IDL.Tuple(Rate, Amount)),
    'base' : TokenData,
    'bids' : IDL.Vec(IDL.Tuple(Rate, Amount)),
    'last' : Rate,
    'quote' : TokenData,
    'last_timestamp' : IDL.Nat64,
    'volume24_USD' : IDL.Opt(Amount),
    'updated_timestamp' : IDL.Nat64,
  });
  const PairResponseOk = IDL.Vec(PairData);
  const PairResponseErr = IDL.Variant({
    'NotFound' : PairId,
    'InvalidDepthLevel' : Level,
    'InvalidDepthLimit' : IDL.Nat32,
  });
  const PairResponse = IDL.Variant({
    'Ok' : PairResponseOk,
    'Err' : PairResponseErr,
  });
  const DataSource = IDL.Principal;
  const PairInfo = IDL.Record({ 'id' : PairId, 'data' : DataSource });
  const ListPairsResponse = IDL.Vec(PairInfo);
  const DVectorChangeRequest = IDL.Record({
    'id' : DVectorId,
    'destination' : IDL.Variant({
      'set' : Account,
      'clear' : IDL.Null,
      'unchanged' : IDL.Null,
    }),
    'algo' : Algo,
  });
  const R_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const MetricKey = IDL.Nat8;
  const MetricVal = IDL.Nat64;
  const Metric = IDL.Tuple(Timestamp, MetricKey, MetricVal);
  const SnapshotResponse = IDL.Record({
    'indexed_right' : IDL.Nat,
    'monitor' : IDL.Vec(Metric),
    'indexed_left' : IDL.Nat,
  });
  const IndexType = IDL.Variant({
    'Stable' : IDL.Null,
    'StableTyped' : IDL.Null,
    'Managed' : IDL.Null,
  });
  const BlockType = IDL.Record({ 'url' : IDL.Text, 'block_type' : IDL.Text });
  const InitArgs = IDL.Record({
    'maxRecordsToArchive' : IDL.Nat,
    'archiveIndexType' : IndexType,
    'maxArchivePages' : IDL.Nat,
    'settleToRecords' : IDL.Nat,
    'minArchiveCycles' : IDL.Nat,
    'archiveCycles' : IDL.Nat,
    'maxActiveRecords' : IDL.Nat,
    'maxRecordsInArchiveInstance' : IDL.Nat,
    'archiveControllers' : IDL.Vec(IDL.Principal),
    'supportedBlocks' : IDL.Vec(BlockType),
  });
  const Stats = IDL.Record({
    'lastIndex' : IDL.Nat,
    'archiveProperties' : InitArgs,
    'localLedgerSize' : IDL.Nat,
    'ledgerCanister' : IDL.Opt(IDL.Principal),
    'bCleaning' : IDL.Bool,
    'archives' : IDL.Vec(IDL.Tuple(IDL.Principal, TransactionRange)),
    'firstIndex' : IDL.Nat,
  });
  const R = IDL.Variant({ 'ok' : IDL.Nat64, 'err' : IDL.Text });
  const Swap = IDL.Service({
    'canister_info' : IDL.Func([], [CanisterInfo], ['query']),
    'create_vector' : IDL.Func(
        [DVectorRequest, IDL.Variant({ 'icp' : IDL.Null, 'ntn' : IDL.Null })],
        [R_4],
        [],
      ),
    'get_architect_vectors' : IDL.Func(
        [
          IDL.Record({
            'id' : IDL.Principal,
            'start' : IDL.Nat,
            'length' : IDL.Nat,
          }),
        ],
        [ArchVectorsResult],
        ['query'],
      ),
    'get_events' : IDL.Func(
        [IDL.Record({ 'start' : IDL.Nat, 'length' : IDL.Nat })],
        [R_3],
        ['query'],
      ),
    'get_vector' : IDL.Func(
        [DVectorId__1],
        [IDL.Opt(DVectorShared)],
        ['query'],
      ),
    'get_vector_events' : IDL.Func(
        [
          IDL.Record({
            'id' : DVectorId,
            'start' : IDL.Nat,
            'length' : IDL.Nat,
          }),
        ],
        [R_3],
        ['query'],
      ),
    'get_vector_price' : IDL.Func([], [R_2], ['query']),
    'icrc3_get_archives' : IDL.Func(
        [GetArchivesArgs],
        [GetArchivesResult],
        ['query'],
      ),
    'icrc3_get_blocks' : IDL.Func(
        [GetBlocksArgs],
        [GetBlocksResult],
        ['query'],
      ),
    'icrc3_supported_block_types' : IDL.Func(
        [],
        [IDL.Vec(BlockType__1)],
        ['query'],
      ),
    'icrc_45_get_pairs' : IDL.Func([PairRequest], [PairResponse], ['query']),
    'icrc_45_list_pairs' : IDL.Func([], [ListPairsResponse], ['query']),
    'init' : IDL.Func([], [], []),
    'modify_vector' : IDL.Func([DVectorChangeRequest], [R_1], []),
    'monitor_snapshot' : IDL.Func([], [SnapshotResponse], ['query']),
    'rechain_stats' : IDL.Func([], [Stats], ['query']),
    'show_log' : IDL.Func([], [IDL.Vec(IDL.Opt(IDL.Text))], ['query']),
    'withdraw_vector' : IDL.Func(
        [
          IDL.Record({
            'id' : DVectorId,
            'to' : Account,
            'amount' : IDL.Nat,
            'location' : VLocation,
          }),
        ],
        [R],
        [],
      ),
  });
  return Swap;
};
export const init = ({ IDL }) => {
  const InitArg = IDL.Record({
    'ICP_ledger_id' : IDL.Principal,
    'RIGHT_ledger' : IDL.Principal,
    'LEFT_ledger' : IDL.Principal,
    'LEFT_aggr_id' : IDL.Nat,
    'DEFI_AGGREGATOR' : IDL.Principal,
    'NTN_ledger_id' : IDL.Principal,
    'RIGHT_aggr_id' : IDL.Nat,
  });
  return [InitArg];
};
