import { Box, Button, Stack, HStack, Grid, GridItem } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import icblast, { toState } from '@infu/icblast';
import { Link } from "react-router-dom";
import { VectorOverview } from "./Vector"
import { useBlast } from "../icblast";
import { Symbol, Amount, AmountFixed } from './Amount';

export function ArchitectVectors({ vecs, architect_id, current_vid }) {


    return <Box h="100%" className="scrollY sbar diagonal-lines" >


        <Total vecs={vecs} />
        <Stack spacing="1" divider={<hr />} >
            {vecs && vecs.entries.map(([id, info]) => <VectorOverview architect_id={architect_id} key={id} id={id} info={info} active={current_vid == id} />
            )}
        </Stack>

    </Box>

}

function Total({ vecs }) {
    if (vecs.entries.length == 0) return null;
    let in_sources = vecs.entries.reduce((acc, [id, info]) => {  
        let t = (acc[info.source.ledger_symbol]?.t ? acc[info.source.ledger_symbol].t : 0) + info.source_balance_available / 10 ** info.source.ledger_decimals;
        let u = t * info.source_rate_usd;
        return { ...acc, [info.source.ledger_symbol]: {t, u} }
    }, {});
    let in_destination = vecs.entries.reduce((acc, [id, info]) => {  
        let t = (acc[info.destination.ledger_symbol]?.t ? acc[info.destination.ledger_symbol].t : 0) + info.destination_balance_available / 10 ** info.destination.ledger_decimals;
        let u = t * info.destination_rate_usd;
        return { ...acc, [info.destination.ledger_symbol]: {t, u} }
    }, {});


    return <Box>
        <Grid gridTemplateColumns={"1fr 1fr"} mt="2" mb="2">
            <GridItem pl="16px">
                <Stack>
                    <Box color="gray.500">Total in sources</Box>
                    {Object.keys(in_sources).map(k => <Box key={k}><Amount val={in_sources[k].t} /> <Symbol>{k}</Symbol> <Box as="span" color="gray.500">(<AmountFixed muted={true} val={ in_sources[k].u} />$)</Box></Box>)}
                </Stack>
            </GridItem>
            <GridItem pl="19px">
                <Stack ><Box color="gray.500">Total in destinations</Box>
                    {Object.keys(in_destination).map(k => <Box key={k}><Amount val={in_destination[k].t} /> <Symbol>{k}</Symbol> <Box as="span" color="gray.500">(<AmountFixed muted={true} val={ in_destination[k].u} />$)</Box></Box>)}
                </Stack>
            </GridItem>
      
        </Grid>
        <hr/>
    </Box>
}