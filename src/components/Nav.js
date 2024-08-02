import { HStack, Box, Button, Stack, Flex, Spacer } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useBlast, login, logout, refresh } from "../icblast";
import { useEffect, useState } from 'react';
import { AccountAddresses, Address } from "../components/Address"
import { useAsyncInterval } from "../hooks/Interval";
import { numberFormat, Symbol, Amount } from './Amount';
import { useSelector } from 'react-redux';
import { MdInput, MdOutput } from "react-icons/md";
import { IconButton } from '@chakra-ui/react';
import { WithdrawAccount } from './Transfer';
import {AdvancedGuideModal} from './Help';
export function Nav() {
    return <Box p={2} className="logotitle">
        <Flex>NEUTRINITE DEVEFI <Spacer /><AdvancedGuideModal/></Flex>
    </Box>
}

export function LeftNav() {

    const blast = useBlast();

    return <Box >
        <Box className="paneltitle" pl="10px" pt="2px">WALLET</Box>
        <Stack p="2">
            {blast.logged ? <><Wallet />
            <AccountAddresses symbol={"ICP"} account={{ owner: blast.me, subaccount: null }} /></> : null}

            {blast.logged ? <Button as={Link} to={"/architect/" + blast.me}>My Vectors</Button> : null}

            {blast.logged ? <Button onClick={logout}>Logout</Button> : <Button onClick={login}>Authenticate</Button>}
        </Stack>
    </Box>
}



function Wallet() {
    const blast = useBlast();

    const balances = useSelector(s => s.account.balances);

    if (!balances) return null;
    return <Stack>

        <Stack spacing="2">
            {Object.keys(balances).map(symbol => <Flex key={symbol} alignItems={"center"} bg="gray.900" p="2" pl="4" borderRadius="8">
                <Box mr="2"><Amount val={(balances[symbol])} /></Box> <Box><Symbol>{symbol}</Symbol></Box><Spacer /><WithdrawAccount symbol={symbol}><IconButton aria-label='Withdraw' icon={<MdOutput />} /></WithdrawAccount></Flex>)}
        </Stack>
    </Stack>
}