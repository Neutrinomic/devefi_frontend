import {
    Input, Textarea, Stack, ButtonGroup, Button, FormControl, FormLabel,
    Box,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor, useDisclosure,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
    Tooltip,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper, useToast,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react'
import React, {useEffect, useRef} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Symbol, numberFormat } from './Amount'
import { sendTokens,sendTokensICP, withdrawVector } from "../reducers/account"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { icrcAddressFromBlast } from "./Address";

import autosize from "autosize";

export function TransferToVector({ to, symbol, children }) {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const firstFieldRef = React.useRef(null)
    const max = useSelector(s => s.account.balances[symbol])
    const toast = useToast();
    const dispatch = useDispatch();

    const send = (amount) => {
        onClose();
        const transferPromise = dispatch(sendTokens({ symbol, to, amount }))

        toast.promise(transferPromise, {
            success: { title: 'Deposit confirmed' },
            error: { title: 'Deposit rejected' },
            loading: { title: 'Deposit pending' },
        })
    }

    return (<Popover
        isOpen={isOpen}
        initialFocusRef={firstFieldRef}
        onOpen={onOpen}
        onClose={onClose}
        placement='left'
        closeOnBlur={true}
  
    >
        <PopoverTrigger>
            {children}
        </PopoverTrigger>
        {isOpen?<PopoverContent p={5} >
            <Box>Deposit <Symbol>{symbol}</Symbol></Box>
            {max ? <Form max={max} btn={"Deposit"} onSend={send} firstFieldRef={firstFieldRef} onCancel={onClose} /> : <Box>
                <Alert status='warning'>
                    <AlertIcon />
                    No {symbol} in your wallet.
                </Alert></Box>}
            <PopoverArrow />
            <PopoverCloseButton />
        </PopoverContent>:null}
    </Popover>
    )
}


function getAccount(textAccount, symbol) {
    let a = textAccount.indexOf("-") > -1 ? "icrc" : "legacy";
    if (a == "icrc") {
        try {
        let account = decodeIcrcAccount(textAccount);
        return {type: a, account}
        } catch (e) {
        }
    } else {
        if (symbol == 'ICP') {
            try {
                if (textAccount.length == 64) {
                let account = AccountIdentifier.fromHex(textAccount);
                return {type: a, account:textAccount}
                }
            } catch (e) {
            }
        }
    }
    return {type: a, account: null};
}
export function InputAccount({ symbol,  onChange, isDisabled = false}) {
    const [textAccount, setTextAccount] = React.useState("");
    const account = getAccount(textAccount, symbol)

    useEffect(() => {
        if (textAccount == "") return;
        onChange(account)
 
    }, [textAccount, symbol])
    
    const ref = useRef();
    useEffect(() => {
        autosize(ref.current);
        return () => {
          autosize.destroy(ref.current);
        };
      }, []);


      const invalid = (textAccount != "" && account?.account == null);
    return <Box><Textarea ref={ref} minH={"25px"} h={"25px"} isDisabled={isDisabled} transition="height none" spellCheck="false" mt={2} isInvalid={invalid} placeholder='account' onChange={(v) => setTextAccount(v.target.value)}  />
        {invalid ? <Alert status='error' h={"12px"} fontSize={"12px"} ><AlertIcon />Invalid account</Alert>:null}
    </Box>

}

export function WithdrawAccount({ symbol, children }) {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const firstFieldRef = React.useRef(null)
    const max = useSelector(s => s.account.balances[symbol])
    const toast = useToast();
    const [account, setAccount] = React.useState({});
    const dispatch = useDispatch();
    

    const send = (amount) => {
        
        if (!account.account) return;
        onClose();
        
        const transferPromise = account.type === "icrc" ? dispatch(sendTokens({ symbol, to: account.account, amount })) : dispatch(sendTokensICP({ symbol, to: account.account, amount }));

        toast.promise(transferPromise, {
            success: { title: 'Withdrawl confirmed' },
            error: { title: 'Withdrawl rejected' },
            loading: { title: 'Withdrawl pending' },
        })
    }



    return (<Popover
        isOpen={isOpen}
        initialFocusRef={firstFieldRef}
        onOpen={onOpen}
        onClose={onClose}
        placement='right'
        closeOnBlur={false}
       
    >
        <PopoverTrigger>
            {children}
        </PopoverTrigger>
        {isOpen?<PopoverContent p={5}  w={"400px"}>
            <Box>Withdraw <Symbol>{symbol}</Symbol> from wallet</Box>
            <Stack>
            <InputAccount symbol={symbol} onChange={setAccount}/>
            
            {max ? <Form max={max} btn={"Withdraw"} btnDisabled={account?.account == false} onSend={send} firstFieldRef={firstFieldRef} onCancel={onClose} /> : <Box>
                <Alert status='warning'>
                    <AlertIcon />
                    No {symbol} in your wallet.
                </Alert></Box>}
                </Stack>                
            <PopoverArrow />
            <PopoverCloseButton />
        </PopoverContent>:null}
    </Popover>

    )
}

export function WithdrawVector({ id, symbol, max, location, children }) {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const firstFieldRef = React.useRef(null)
    const toast = useToast();
    const dispatch = useDispatch();

    const withdraw = (amount) => {
        onClose();
        const transferPromise = dispatch(withdrawVector({ id, symbol, location, amount }))

        toast.promise(transferPromise, {
            success: { title: 'Withdrawal sent' },
            error: { title: 'Withdrawal rejected' },
            loading: { title: 'Withdrawal pending' },
        })
    }

    return (<Popover
        isOpen={isOpen}
        initialFocusRef={firstFieldRef}
        onOpen={onOpen}
        onClose={onClose}
        placement='left'
        closeOnBlur={true}
    >
        <PopoverTrigger>
            {children}
        </PopoverTrigger>
        {isOpen?<PopoverContent p={5}>
            <Box>Withdraw <Symbol>{symbol}</Symbol></Box>
            {(max && max != 0) ? <Form max={max} btn="Withdraw" onSend={withdraw} firstFieldRef={firstFieldRef} onCancel={onClose} /> : <Box>
                <Alert status='warning'>
                    <AlertIcon />
                    Your vector {"source" in location?"source":"destination"} is empty. 
                </Alert></Box>}
            <PopoverArrow />
            <PopoverCloseButton />
        </PopoverContent>:null}
    </Popover>

    )
}



// 2. Create the form
const Form = ({ max, onSend, btn, firstFieldRef, onCancel, btnDisabled=false }) => {
    const [amount, setAmount] = React.useState(max);
    const [showTooltip, setShowTooltip] = React.useState(false);

    return (
        <Stack spacing={4}>

            <Slider
                mt={4}
                mb={3}
                id='slider'
                value={amount / max * 100}
                min={0}
                max={100}
                colorScheme='teal'
                onChange={(v) => setAmount(Number(numberFormat(v / 100 * max)))}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                focusThumbOnChange={false}
            >
                <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>
                    25%
                </SliderMark>
                <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>
                    50%
                </SliderMark>
                <SliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>
                    75%
                </SliderMark>
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <Tooltip
                    hasArrow
                    bg='teal.500'
                    color='white'
                    placement='top'
                    isOpen={showTooltip}
                    label={`${Math.round(amount / max * 100)}%`}
                >
                    <SliderThumb />
                </Tooltip>
            </Slider>

            <NumberInput step={Number(numberFormat(max / 100))} value={amount} ref={firstFieldRef} onChange={(value) => {
                setAmount(value)
            }}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>


            <ButtonGroup display='flex' justifyContent='flex-end'>
                <Button variant='outline' onClick={onCancel}>
                    Cancel
                </Button>
                <Button colorScheme='teal' onClick={() => onSend(amount)} isDisabled={btnDisabled}>
                    {btn}
                </Button>
            </ButtonGroup>
        </Stack>
    )
}

