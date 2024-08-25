import { Box, Button, Stack, HStack, useClipboard, Tooltip } from '@chakra-ui/react';
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp";
import {CopyIcon} from "@chakra-ui/icons";
import { Hashicon } from '@emeraldpay/hashicon-react';

export function AccountAddresses ({symbol, account}) {
    let addresses = AccountToText(symbol, account);
    return <Stack spacing="3">

        {Object.keys(addresses).map((k) => <Stack key={k} spacing="0">
            <Box className="veclbl">{k}</Box><Box><Address addr={addresses[k]} /></Box>
            </Stack>)}
 
    </Stack>

}


export function AddressIcon({addr}) {
    return <Hashicon value={AccountToText("", addr).icrc} size={48} />
};

export function Address({ addr }) {
    let ad = addr;
    if (typeof addr != "string") ad = AccountToText(false, addr).icrc
    const { onCopy, value, setValue, hasCopied } = useClipboard(ad);

    return <Tooltip placement={"left"} label={ad}><Box className="active" as="span" onClick={onCopy}><CopyIcon/> {shortenAddress(ad)}</Box></Tooltip>
}

function shortenAddress(addr) {
    // if there is a . in the string trim zeroes at the end
    if (addr.indexOf(".") > -1) return addr.slice(0, 7) + " ··· " + addr.replace(/0*$/g, "").slice(-7);
    else return addr.slice(0, 7) + " ··· " + addr.slice(-7);
}

export function icrcAddressFromBlast(a) {
    return encodeIcrcAccount({
        owner: Principal.fromText(a.owner),
        subaccount: a.subaccount?fromHexString(a.subaccount):null
    });
}

const fromHexString = (hexString) =>
    Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

function AccountToText(symbol, account) {
    let rez = {};
  

    rez.icrc = encodeIcrcAccount({
        owner: Principal.fromText(account.owner),
        subaccount: account.subaccount?fromHexString(account.subaccount):null
    });

    if (symbol == "ICP") {
        let subacc = account.subaccount?SubAccount.fromBytes(fromHexString(account.subaccount)):SubAccount.fromID(0);
        let acc = {principal: Principal.fromText(account.owner), subAccount:subacc};
        rez.legacy = AccountIdentifier.fromPrincipal(acc).toHex()
    }
    return rez;
}