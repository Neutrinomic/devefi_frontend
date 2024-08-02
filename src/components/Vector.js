/* global BigInt */

import { Box, Button, GridItem, Grid, Stack, HStack, IconButton, Wrap, Flex, Spacer, FormControl, Text, Checkbox, Radio, RadioGroup, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { Await, Link } from "react-router-dom";
import { AccountAddresses, Address } from "../components/Address"
import { Time } from "./Time";
import { numberFormat, Symbol, Amount, ForOne } from "./Amount";
import { useBlast } from "../icblast";
import { MdInput, MdOutput } from "react-icons/md";
import { TransferToVector, WithdrawVector } from "./Transfer";
import { produce } from "immer"
import React from "react"
import { Algo_v1 } from './algo/Algo_v1';
import { InputAccount } from './Transfer';

export function VectorOverview({ architect_id, id, info, active = false }) {
    return <Link to={`/architect/${architect_id}/${id}`} ><Box sx={{ position: "relative" }} bg="gray.800" >
        {active ? <div className="arrow-right"></div> : null}

        <Grid
            gridTemplateColumns={"170px 1fr 170px 1fr"}
            gridTemplateRows={"auto 1fr"}
            ml="4"
            mr="4"
            pt="2" pb="2"
        >
            <GridItem>
                <Box className="veclbl">source</Box>
                <TokenSymbol symbol={info.source.ledger_symbol} />
            </GridItem>
            <GridItem>
                <Val label={"balance"}><Amount val={(Number(info.source_balance_available) / 10 ** info.source.ledger_decimals)} /> <Symbol>{info.source.ledger_symbol}</Symbol></Val>
                <Val label={"tradable"}><Amount val={(Number(info.source_balance_tradable) / 10 ** info.source.ledger_decimals)} /> <Symbol>{info.source.ledger_symbol}</Symbol></Val>
                <Val label={"rate"}><Amount muted={true} val={(info.rate)} /> <Symbol>{info.source.ledger_symbol}</Symbol> for <ForOne /> <Symbol>{info.destination.ledger_symbol}</Symbol></Val>
            </GridItem>
            <GridItem borderLeft="2px solid var(--chakra-colors-gray-900)" pl="4">
                <Box className="veclbl">destination</Box>
                <TokenSymbol symbol={info.destination.ledger_symbol} />
            </GridItem>
            <GridItem >
                <Val label={"balance"}><Amount val={(Number(info.destination_balance_available) / 10 ** info.destination.ledger_decimals)} /> <Symbol>{info.destination.ledger_symbol}</Symbol></Val>
            </GridItem>
        </Grid>

    </Box></Link>



}

/*
{
    "created": 1706118645,
    "destination": {
        "ledger_symbol": "ckBTC",
        "ledger_decimals": "8",
        "ledger": "mxzaz-hqaaa-aaaar-qaada-cai",
        "address": {
            "owner": "xgnzu-riaaa-aaaal-qc64a-cai",
            "subaccount": "0200000000000000000000000000000000000000000000000000000000000000"
        },
        "ledger_fee": "10"
    },
    "source_balance": "0",
    "active": false,
    "source": {
        "ledger_symbol": "ICP",
        "ledger_decimals": "8",
        "ledger": "ryjl3-tyaaa-aaaaa-aaaba-cai",
        "address": {
            "owner": "xgnzu-riaaa-aaaal-qc64a-cai",
            "subaccount": "0100000000000000000000000000000000000000000000000000000000000000"
        },
        "ledger_fee": "10000"
    },
    "owner": "z45mi-3hwqo-bsda6-saeqm-fambt-gp7rn-aynd3-v4oga-dfe24-voedf-mae",
    "rate": 3598.3638305972413,
    "destination_balance": "8255",
    "algo": {
        "max": 4000,
        "multiplier": 0.01
    },
    "source_balance_available": "0",
    "total_events": "32",
    "unconfirmed_transactions": []
}
*/

export function VectorHeader({ id, info }) {
    const blast = useBlast();
    const mine = blast.me == info.owner;

    if (!info) return <Box>Loading...</Box>

    // const deposit_destination = async () => {
    //     let ledger = blast.ledgers[ info.destination.ledger_symbol ];
    //     let balance = await ledger.icrc1_balance_of({owner: blast.me});
    //     balance = balance / 2n;
    //     let fee = BigInt(info.destination.ledger_fee);
    //     await ledger.icrc1_transfer({to: info.destination.address, amount: balance - fee}).then(console.log);
    // };

    return <Box>
        <Box className="paneltitle" pl="4" pt="2px">VECTOR {id.toString().padStart(6, "0")}</Box>
        <Grid

            gridTemplateColumns={"1fr 1fr"}
            gridTemplateRows={"auto 1fr"}
            m="4"
        >
            <GridItem>
                <Box className="veclbl">source</Box>
                <HStack align="end"><TokenSymbol symbol={info.source.ledger_symbol} /><Box>{numberFormat(info.source_rate_usd)}$</Box></HStack>
                <AccountAddresses symbol={info.source.ledger_symbol} account={info.source.address} />
            </GridItem>
            <GridItem borderLeft="2px solid var(--chakra-colors-gray-900)" pl="4">
                <Box className="veclbl">destination {info.remote_destination ? "(remote)" : ""}</Box>
                <HStack align="end"><TokenSymbol symbol={info.destination.ledger_symbol} /><Box>{numberFormat(info.destination_rate_usd)}$</Box></HStack>
                <AccountAddresses symbol={info.destination.ledger_symbol} account={info.destination.address} />
            </GridItem>

            <GridItem>

                <Val label={"balance"}><Amount val={(Number(info.source_balance_available) / 10 ** info.source.ledger_decimals)} /> <Symbol>{info.source.ledger_symbol}</Symbol>
                    <Box as="span" className="muted">{" "}({((Number(info.source_balance_available) / 10 ** info.source.ledger_decimals) * info.source_rate_usd).toFixed(2)}$)</Box>
                </Val>
                <Val label={"tradable"}><Amount val={(Number(info.source_balance_tradable) / 10 ** info.source.ledger_decimals)} /> <Symbol>{info.source.ledger_symbol}</Symbol>
                    <Box as="span" className="muted">{" "}({((Number(info.source_balance_tradable) / 10 ** info.source.ledger_decimals) * info.source_rate_usd).toFixed(2)}$)</Box>
                </Val>
                <Val label={"in transit"}><Amount val={((Number(info.source_balance) - Number(info.source_balance_available)) / 10 ** info.source.ledger_decimals)} /> <Symbol>{info.source.ledger_symbol}</Symbol>
                    <Box as="span" className="muted">{" "}({(((Number(info.source_balance) - Number(info.source_balance_available)) / 10 ** info.source.ledger_decimals) * info.source_rate_usd).toFixed(2)}$)</Box>
                </Val>
                {mine?<HStack><TransferToVector to={info.source.address} symbol={info.source.ledger_symbol}><IconButton aria-label='Deposit' icon={<MdInput />} /></TransferToVector>
                    <WithdrawVector id={id} symbol={info.source.ledger_symbol} max={(Number(info.source_balance_available) / 10 ** info.source.ledger_decimals)} location={{ source: null }}><IconButton aria-label='Withdraw' icon={<MdOutput />} /></WithdrawVector>
                </HStack>:null}
            </GridItem>
            <GridItem borderLeft="2px solid var(--chakra-colors-gray-900)" pl="4">
                <Val label={"balance"}><Amount val={(Number(info.destination_balance_available) / 10 ** info.destination.ledger_decimals)} /> <Symbol>{info.destination.ledger_symbol}</Symbol>
                    <Box as="span" className="muted">{" "}({((Number(info.destination_balance) / 10 ** info.destination.ledger_decimals) * info.destination_rate_usd).toFixed(2)}$)</Box>

                </Val>
                <Val label={"in transit"}><Amount val={((Number(info.destination_balance) - Number(info.destination_balance_available)) / 10 ** info.destination.ledger_decimals)} /> <Symbol>{info.destination.ledger_symbol}</Symbol>
                    <Box as="span" className="muted">{" "}({(((Number(info.destination_balance) - Number(info.destination_balance_available)) / 10 ** info.destination.ledger_decimals) * info.destination_rate_usd).toFixed(2)}$)</Box>
                </Val>
                {mine?<HStack>
                    {/* <IconButton aria-label='Deposit' onClick={deposit_destination} icon={<MdInput />}/> */}
                    {!info.remote_destination ? <WithdrawVector id={id} symbol={info.destination.ledger_symbol} max={(Number(info.destination_balance_available) / 10 ** info.destination.ledger_decimals)} location={{ destination: null }}><IconButton aria-label='Withdraw' icon={<MdOutput />} /></WithdrawVector> : null}
                </HStack>:null}

            </GridItem>
        </Grid>
        {mine && info.algo? <><hr />
        <Box className="paneltitle" pl="4" pt="2px">SETTINGS</Box>
        <ModifyVector key={id +"."+ info.modified} id={id} vector={info} />
</>:null}
   
        <hr />
        <Wrap m="4" mt="0" spacing="4">
            <Val label={"total events"}>{info.total_events}</Val>
            <Val label={"created"}><Time time={info.created} /></Val>
            <Val label={"modified"}><Time time={info.modified} /></Val>
            <Val label={"active"}>{info.active ? "yes" : "no"}</Val>
            <Val label={"owner"}><Address addr={info.owner} /></Val>
        </Wrap>

    </Box>
}

function ModifyVector({ id, vector }) {

    const blast = useBlast();
    const [modVector, setModVector] = React.useState(vector);
    const [modChanged, setModChanged] = React.useState(false);
    const [destinationChange, setDestinationChange] = React.useState(false);
    const [changeRadio, setChangeRadio] = React.useState('unchanged');
    const toast = useToast();
    const toastIdRef = React.useRef()
    const [disableButton, setDisableButton] = React.useState(false)

    let [poolid, vid] = id.split(".");
    vid = parseInt(vid, 10);
    let [source, destination] = poolid.split("_");
    let pool = blast.pools[`${source}_${destination}`] || blast.pools[`${destination}_${source}`];
    if (!pool) throw new Error("Pool not found");

    const set = (f) => (e) => {
        setModChanged(true);
        setModVector(produce(modVector, (x) => f(e, x)));
    }

    const saveModVector = async () => {
        setDisableButton(true)
        try {
            let saveVector = modVector;

            let dchange = { unchanged: null };

            if (changeRadio == 'set') {
                if (destinationChange) {
                    dchange = { set: destinationChange };
                }
            }
            if (changeRadio == 'clear') {
                dchange = { clear: null };
            }

            toastIdRef.current = toast({
                title: 'Modification pending',
                status: 'loading',
                duration: 9000,
                isClosable: false
            })

            let rez = await pool.modify_vector({ id:vid, algo: saveVector.algo, destination: dchange });
            if (rez.err) {
                toast.update(toastIdRef.current, { status: 'error', title: "Error", description: rez.err, duration: 5000, isClosable: true })
            } else {
                toast.update(toastIdRef.current, { title: "Success", status: 'success', duration: 2000, isClosable: true })
            }
        } catch (e) {
            console.log(e);
        }

        setDisableButton(false)

    }
    return <Stack p="4">
        <Box color="gray.600">Trade algorithm (private)</Box>
        <Algo_v1 v={modVector} set={set} />
        <FormControl>
            <RadioGroup onChange={setChangeRadio} value={changeRadio}>

                <Stack direction='row' >
                    <Box color="gray.600">Destination</Box>
                    <Radio value='unchanged'>unchanged</Radio>
                    <Radio value='set'>set</Radio>
                    {modVector.remote_destination?<Radio value='clear'>clear</Radio>:null}
                </Stack>
            </RadioGroup>
            
            {changeRadio == 'set' ? <><Alert status='warning'><AlertIcon />Make sure you have access to the remote address and it supports {modVector.destination.ledger_symbol}. Please be really careful.</Alert> <InputAccount onChange={(v) => setDestinationChange(v.account)} /> </>: null}
        </FormControl>
        {(changeRadio == 'clear' || (changeRadio == 'set' && destinationChange) || modChanged) ? <Box><Flex><Spacer /><Button isLoading={disableButton} onClick={saveModVector} colorScheme="blue">Save changes</Button></Flex></Box> : null}
    </Stack>
}

function TokenSymbol({ symbol }) {
    return <Box className="token-symbol">{symbol}</Box>
}

function Val({ label, children }) {
    return <Box className="vecv"><Box className="v-lbl">{label}</Box><Box className="v-val">{children}</Box></Box>
}