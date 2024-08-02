import { Box, Button, Wrap, Stack, HStack, Grid, GridItem, Flex, Spacer, Checkbox} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useBlast } from "../icblast";
import { useAsyncInterval } from "../hooks/Interval";
import { toState } from '@infu/icblast';
import { ArrowRightIcon, ArrowLeftIcon } from '@chakra-ui/icons'
import { Time } from "./Time";
import { numberFormat, Symbol, AmountFixed } from "./Amount";
import { Address } from './Address';
export function VectorHistory({ id, total, vec }) {
    const blast = useBlast();
    let fetch_max = 100;
    let keep_max = 100;
    const [verbose, setVerbose] = useState(false);

    let [data, setData] = useState([]);
    let [last, setLast] = useState(total);
    let [poolid, vid] = id.split(".");

    vid = parseInt(vid, 10);
    
    let [source, destination] = poolid.split("_");
    let pool = blast.pools[`${source}_${destination}`] || blast.pools[`${destination}_${source}`];
    if (!pool) throw new Error("Pool not found");

    useEffect(() => {
        // Define a function that wraps the async call
        const fetchData = async () => {
            try {
                let start = total > last ? Math.max(0, Math.max(last, total - fetch_max)) : Math.max(0, last - fetch_max);
                let { ok } = await pool.get_vector_events({ id:vid, start: Math.max(0, start), length:fetch_max });
                let entries = ok.entries;
                if (!verbose) entries = ok.entries.filter(([id, d]) => d?(d.kind["swap"] || d.kind["source_in"] ||  d.kind["withdraw"]):false).filter(Boolean);
                let rez = toState(entries.reverse());
                rez = rez.filter(x => data.findIndex(([id, d]) => id == x[0]) == -1);
                // const result = await asyncFunction();
                let newarr = [...rez, ...data];
                newarr.length = Math.min(newarr.length, keep_max); // trim after length
                setData(newarr);
                setLast(Number(ok.total));
            } catch (error) {
                console.error('Error in async function:', error);
            }
        };

        // Call the function immediately and then set up the interval
        fetchData();
        // const intervalId = setInterval(fetchData, 5000);

        // // Clear the interval on component unmount
        // return () => clearInterval(intervalId);
    }, [total, verbose]); // dependencies array


    if (!data.length) return null;
    return <Box className="scrollY sbar diagonal-lines" pb="10vh">
        
            <Flex className="paneltitle" mt="2px">
                <Box pl="2">VECTOR LOG</Box>
                <Spacer />
                <Box pr="2" mt="-2px" ><Checkbox onChange={e => setVerbose(e.target.checked)}><Box as="span" fontSize="12px" >verbose</Box></Checkbox></Box>
            </Flex>
        
        <Stack bg="gray.800" spacing="0">{data.map(([id, d]) => <HistoryEntry vec={vec} key={id} id={id} d={d} vid={vid} />)}</Stack></Box>

}

function HistoryEntry({ id, d, vec, vid }) {
    if (!d) return null;
    let kind = Object.keys(d.kind)[0];
    let now = Math.floor(Date.now() / 1000);
    let highlight = (d.timestamp > now - 60*2)?"hl-history":"";

    return <HStack className={"hist-entry "+highlight} borderBottom="1px solid var(--chakra-colors-gray-900)" spacing="4" sx={{ overflow: "hidden" }}>
            <Val label="id">{id}</Val>
            <Val label="kind" w={"150px"}><ArrowRightIcon w="14px" h="14px" /> {kind} </Val>
            <Val label="time" w={"190px"}><Time time={d.timestamp} /></Val>

            <HistoryKind kind={kind} x={d.kind[kind]} vec={vec} vid={vid} />

            {/* <GridItem area="destination" alignSelf="center" justifySelf="center"><ArrowRightIcon w="26px" h="26px"/></GridItem> */}

        </HStack>
   
}


function Val({ label, w, children }) {
    return <Stack w={w} borderLeft="2px solid var(--chakra-colors-gray-900)" pl="3"><Box className="hist-lbl">{label}</Box><Box>{children}</Box></Stack>
}

function HistoryKind({ kind, x, vec, vid }) {
    switch (kind) {
        case "source_in":
            return <>
                <Val label="amount"><AmountFixed val={(x.amount / 10 ** vec.source.ledger_decimals)}/> <Symbol>{vec.source.ledger_symbol}</Symbol></Val>
                <Val label="fee"><AmountFixed val={(x.fee / 10 ** vec.source.ledger_decimals)}/> <Symbol>{vec.source.ledger_symbol}</Symbol></Val>
            </>;
        case "source_out":
            return <>


                <Val label="amount"><AmountFixed val={(x.amount / 10 ** vec.source.ledger_decimals)}/> <Symbol>{vec.source.ledger_symbol}</Symbol></Val>

                <Val label="fee"><AmountFixed val={(x.fee / 10 ** vec.source.ledger_decimals)}/> <Symbol>{vec.source.ledger_symbol}</Symbol></Val>
                <Val label="vid">{x.vid}</Val>

            </>;
        case "destination_out":
            return <>
                <Val label="amount"><AmountFixed val={(x.amount / 10 ** vec.destination.ledger_decimals)}/> <Symbol>{vec.destination.ledger_symbol}</Symbol></Val>                <Val label="fee">{x.fee}</Val>
            </>

        case "destination_in":
            return <>

                <Val label="amount"><AmountFixed val={(x.amount / 10 ** vec.destination.ledger_decimals)}/> <Symbol>{vec.destination.ledger_symbol}</Symbol></Val>                <Val label="fee">{x.fee}</Val>
                <Val label="fee"><AmountFixed val={(x.fee / 10 ** vec.destination.ledger_decimals)}/> <Symbol>{vec.destination.ledger_symbol}</Symbol></Val>
                <Val label="vid">{x.vid}</Val>
                <Val label="vtx_id">{x.vtx_id}</Val>

            </>

        case "swap":

            return <>
                <Val label="amountIn"><AmountFixed val={(x.amountIn / 10 ** vec.destination.ledger_decimals)}/> <Symbol>{vec.destination.ledger_symbol}</Symbol></Val>                        
                <Val label="amountOut"><AmountFixed val={(x.amountOut / 10 ** vec.source.ledger_decimals)}/> <Symbol>{vec.source.ledger_symbol}</Symbol></Val>                        
                <Val label="fee"><AmountFixed val={(x.fee / 10 ** vec.source.ledger_decimals)}/> <Symbol>{vec.source.ledger_symbol}</Symbol></Val>
                <Val label="from">{x.from}</Val>
                <Val label="to">{x.to}</Val>
            </>
        case "withdraw":

            switch(x.location) {
                case "source":
                   return <> <Val label="amount"><AmountFixed val={(x.amount / 10 ** vec.source.ledger_decimals)}/> <Symbol>{vec.source.ledger_symbol}</Symbol></Val>                        
                    <Val label="fee"><AmountFixed val={(x.fee / 10 ** vec.source.ledger_decimals)}/> <Symbol>{vec.source.ledger_symbol}</Symbol></Val>
                    <Val label="from">{x.from}</Val>
                    <Val label="to"><Address addr={x.to}/></Val></>
                case "destination":
                default:
                    return <> <Val label="amount"><AmountFixed val={(x.amount / 10 ** vec.destination.ledger_decimals)}/> <Symbol>{vec.destination.ledger_symbol}</Symbol></Val>                        
                    <Val label="fee"><AmountFixed val={(x.fee / 10 ** vec.destination.ledger_decimals)}/> <Symbol>{vec.destination.ledger_symbol}</Symbol></Val>
                    <Val label="from">{x.from}</Val>
                    <Val label="to"><Address addr={x.to}/></Val></>
            };
            
        
        case "tx_sent":
            return <>

                <Val label="vtx_id">{x.vtx_id}</Val>
                <Val label="retry">{x.retry}</Val>
                <Val label="error">{x.error ? "yes" : "no"}</Val>

            </>
        default:
            return <Box>unknown</Box>;
    }
}
