import React from 'react';
import { Box, Input } from '@chakra-ui/react';
import { produce } from 'immer';

export function Algo_v1({ v, set }) {
    const style = { variant: 'flushed', textAlign: "center", color: "blue.400", sx: { display: "inline-block" } }

    return <Box>
        <Box>Buy {v.destination.ledger_symbol} with {v.source.ledger_symbol} based on
            the current {v.source.ledger_oracle}/{v.destination.ledger_oracle} exchange rate.
            The trade price is <Input type="number" onChange={set((e, x) => { x.algo.v1.multiplier = parseFloat(e.target.value); })} value={v.algo.v1.multiplier} {...style} w={"80px"} /> times the current rate, with a
            variation (increase or decrease) of up to <Input type="number" onChange={set((e, x) => { x.algo.v1.multiplier_wiggle = parseFloat(e.target.value); })} value={v.algo.v1.multiplier_wiggle} {...style} w={"80px"} /> times the rate.
            This variation will follow a sinusoidal pattern, meaning it will smoothly fluctuate up and down,
            and this cycle will repeat every <Input type="number" onChange={set((e, x) => { x.algo.v1.multiplier_wiggle_seconds = parseFloat(e.target.value); })} value={v.algo.v1.multiplier_wiggle_seconds} w={"120px"} {...style} /> seconds.</Box>
        <Box>Maximum rate is <Input type="number" {...style} onChange={set((e, x) => { x.algo.v1.max = parseFloat(e.target.value); })} value={v.algo.v1.max} w={"120px"} /> {v.source.ledger_symbol} for 1.0 {v.destination.ledger_symbol}.</Box>
        <Box>There are maximum <Input type="number" {...style} onChange={set((e, x) => { x.algo.v1.max_tradable_usd = parseFloat(e.target.value); })} value={v.algo.v1.max_tradable_usd} w={"120px"} />$ worth of tokens inside the tradable
            balance. That balance will be replenished with <Input type="number" onChange={set((e, x) => { x.algo.v1.interval_release_usd = parseFloat(e.target.value); })} value={v.algo.v1.interval_release_usd} {...style} w={"120px"} />$ worth of
            tokens every <Input type="number" onChange={set((e, x) => { x.algo.v1.interval_seconds = parseInt(e.target.value); })} value={v.algo.v1.interval_seconds} {...style} w={"120px"} />sec.</Box>

    </Box>
}