import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl, FormLabel, Box, Text, Flex, Spacer, Tooltip,
    Input, Button, useDisclosure, Select, HStack, Checkbox, Stack, Alert, AlertIcon, IconButton, useToast
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { InputAccount } from "./Transfer"
import { AddIcon, ArrowForwardIcon, CheckIcon } from "@chakra-ui/icons"
import { Algo_v1 } from "./algo/Algo_v1"
import { useBlast } from "../icblast"
import { produce } from "immer"
import { approveTokens } from "../reducers/account"
import {useDispatch} from "react-redux"

export function ModalOpen({ onClose }) {

    const blast = useBlast()
    const dispatch = useDispatch();
    const [agree, setAgree] = React.useState(true)
    const toast = useToast();
    const toastIdRef = React.useRef()
    const [disableButton, setDisableButton] = React.useState(false)
    const ledgers = blast.meta.ledgers;
    const pools = blast.meta.pools;
    const [vector, setVector] = useState({
        owner: blast.me,
        source: {
            ledger: ledgers.ICP.id,
            ledger_symbol: "ICP",
        },
        destination: {
            ledger: ledgers.ckBTC.id,
            ledger_symbol: "ckBTC",
            address: null
        },
        algo: {
            v1: {
                max: 0,
                multiplier: 1.01,
                multiplier_wiggle: 0.005,
                multiplier_wiggle_seconds: 60,
                interval_seconds: 10,
                interval_release_usd: 3,
                max_tradable_usd: 5
            }
        }
    });

    const set = (f) => (e) => {
        setVector(produce(vector, (x) => f(e, x)));
    }
    let valid = { ok: true }

    if (vector.source.ledger === vector.destination.ledger) { valid = { ok: false, error: 'Source and destination tokens must be different' } };
    if (!vector.source.ledger) { valid = { ok: false, error: 'Source token must be selected' } };
    if (!vector.destination.ledger) { valid = { ok: false, error: 'Destination token must be selected' } };

    const [prices, setPrices] = useState(null)
    const [aggrPrices, setAggrPrices] = useState(null)

    useEffect(() => {
        const load = async () => {
            let p = await blast.pools[ Object.keys(blast.pools)[0] ].get_vector_price();
            setPrices(p.ok);
        };
    
        // Call load immediately and then set up the interval
        load();
        const intervalId = setInterval(load, 5000); // 5000 milliseconds = 5 seconds
    
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const load = async () => {
            let p = await blast.prices.get_latest_extended();
            let rez = {};
            for (let le in ledgers) {
                try {
                rez[le] = p.find(y => Number(y.id) == ledgers[le].priceid).rates.find(x => x.to_token == 0).rate
                } catch (e) {
                    rez[le] = 1;
                }
            }
            
            if (vector.algo.v1.max == 0) setVector(produce(vector, (x) => { x.algo.v1.max = (rez[vector.destination.ledger_symbol] / rez[vector.source.ledger_symbol])*1.2 }));

            setAggrPrices(rez);
        };
    
        // Call load immediately and then set up the interval
        load();
        const intervalId = setInterval(load, 10000); // 5000 milliseconds = 5 seconds
    
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [vector]);

    let found_pool = blast.pools[`${vector.source.ledger_symbol}_${vector.destination.ledger_symbol}`] || blast.pools[`${vector.destination.ledger_symbol}_${vector.source.ledger_symbol}`];
    let found_pool_id = blast.poolsId[`${vector.source.ledger_symbol}_${vector.destination.ledger_symbol}`] || blast.poolsId[`${vector.destination.ledger_symbol}_${vector.source.ledger_symbol}`];


    const createSend = async (paymentCurrency) => {
        setDisableButton(paymentCurrency)
        if ( localStorage.getItem("anvil") == 'yes' && prompt("Test mode. Provide password to continue") !== "anvil") {
            alert("wrong password");
            onClose();
            return;
        };
        try {
            toastIdRef.current = toast({
                title: 'Creating vector',
                status: 'loading',
                duration: 22000,
                isClosable: false
            })
            
            // Find the pool id based on the source and destination ledgers
            if (!found_pool) throw new Error("Pool not found");
            try {
                
                await dispatch(approveTokens({ symbol: paymentCurrency.toUpperCase(), amount:  Number((2n*10000n + prices[paymentCurrency])) / 10 ** 8,  spender:{owner: found_pool.$principal}}));
            } catch (e) {
                toast.update(toastIdRef.current, { status: 'error', title: "Error", description: JSON.stringify(e.message), duration: 5000, isClosable: true })
            }
            let rez = await found_pool.create_vector(vector, { [paymentCurrency]: null });

            if (rez.err) {
                toast.update(toastIdRef.current, { status: 'error', title: "Error", description: rez.err, duration: 5000, isClosable: true })
            } else {
                toast.update(toastIdRef.current, { status: 'success', title: "Success", duration: 2000, isClosable: true })
            }

        } catch (e) {
            console.log(e);
            toast.update(toastIdRef.current, { status: 'error', title: "Error", description: e.message, duration: 5000, isClosable: true })
        }

        setDisableButton(false)
        onClose();
    }

 
    if (!found_pool) { valid = {ok:false, error:"No pool between source and destination"}};

    return <ModalContent >
        <ModalHeader>Create a single vector</ModalHeader>
        <Box mt="-54px" textAlign="center"><ArrowForwardIcon w={"80px"} h={"80px"} color={"gray.600"} /></Box>
        <ModalCloseButton />
        <ModalBody pb={6}>
            <Stack>
                <HStack>
                    <FormControl>
                        <FormLabel>Source ledger <Text as="span" size="sm" color="orange.500">(<Explain label={"Can't be changed later"}>permanent</Explain>)</Text></FormLabel>
                        <Select isRequired value={vector.source.ledger} onChange={set((e, x) => { x.source.ledger = e.target.value; x.algo.v1.max = 0; x.source.ledger_symbol = findKeyById(ledgers, e.target.value) })} placeholder='Select token'>{Object.keys(ledgers).map(symbol => ledgers[symbol].vectors?<option key={symbol} value={ledgers[symbol].id}>{symbol}</option>:null).filter(Boolean)}
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Destination ledger <Text as="span" size="sm" color="orange.500">(permanent)</Text></FormLabel>
                        <Select isRequired value={vector.destination.ledger} onChange={set((e, x) => { x.destination.ledger = e.target.value; x.algo.v1.max = 0; x.destination.ledger_symbol = findKeyById(ledgers, e.target.value) })} placeholder='Select token'>{Object.keys(ledgers).map(symbol => ledgers[symbol].vectors?<option key={symbol} value={ledgers[symbol].id}>{symbol}</option>:null).filter(Boolean)}
                        </Select>
                    </FormControl>
                </HStack>
                <FormControl>
                    <Box mb={2}>Remote destination <Text as="span" size="sm" color="gray.500">(changable later)</Text></Box>
                    <InputAccount onChange={set((e, x) => { x.destination.address = e.account; })} />
                </FormControl>
                <br />
                <Box>Trade algorithm <Text as="span" size="sm" color="blue.500">(<Explain label={"Not visible thru the API, but it is theoretically possible for node providers to read it before this gets to run in a secure enclave (planned)"}>private</Explain>)</Text> <Text as="span" size="sm" color="gray.500">(changable later)</Text></Box>

                <Algo_v1 v={vector} set={set} />
                <Box>
                    {(!valid.ok && valid.error) ? <Alert status='error'><AlertIcon />{valid.error}</Alert> : null}
                </Box>
            </Stack>

            <Stack mt="10px">
                <HStack>
                    <Box w="50%">
                        <Box ><CheckIcon color="green.400" /> Vectors are forever</Box>
                        <Box ><CheckIcon color="green.400" /> Each vector for a one-time fee</Box>
                        <Box ><CheckIcon color="green.400" /> Zero trading fees</Box>
                        <Box ><CheckIcon color="green.400" /> No limits</Box>
                    </Box>
                    <Box w="50%">
                        <Box ><CheckIcon color="green.400" /> Easy to use by DAOs</Box>
                        <Box ><CheckIcon color="green.400" /> Developer friendly</Box>
                        <Box ><CheckIcon color="green.400" /> Protocol friendly</Box>
                        <Box ><CheckIcon color="green.400" /> Arbitrage trader friendly</Box>
                    </Box>
                </HStack>
            </Stack>

            {/* <Box mt="20px"><Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>I agree to the TOS and that my vector will be <Explain label={"Removed from volume statistics"}>muted</Explain> or <Explain label={"Not allowed to trade"}>suspended</Explain> if it engages in market manipulation</Checkbox></Box> */}

            {prices ? <Flex mt="20px" alignItems="center"><Box><Button onClick={onClose}>Cancel</Button></Box>
                <Spacer />
                <Button isLoading={disableButton == 'ntn'} h="76px" colorScheme='blue' isDisabled={!valid.ok || !agree} onClick={() => createSend('ntn')}>
                    Create <br />one-time fee {(Number(prices.ntn) / 10 ** 8).toFixed(2)} NTN<br/>per vector
                </Button>
                <Box p="2">or</Box>
                <Button isLoading={disableButton == 'icp'} h="76px" colorScheme='blue' isDisabled={!valid.ok || !agree} onClick={() => createSend('icp')}>
                    Create <br />one-time fee {(Number(prices.icp) / 10 ** 8).toFixed(2)} ICP<br/>per vector
                </Button>
            </Flex> : null}
        </ModalBody>



    </ModalContent>
}

export function CreateVector() {

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
            <IconButton onClick={onOpen} icon={<AddIcon />} w={"50px"} h={"50px"} colorScheme={"blue"}/>


            <Modal size="xl"
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                {isOpen ? <ModalOpen onClose={onClose} /> : null}
            </Modal>
        </>
    )
}

function Explain({ label, children }) {
    return <Tooltip label={label} ><Box as="span" sx={{ borderBottom: "1px dashed orange" }}>{children}</Box></Tooltip>
}

function findKeyById(obj, id) {
    return Object.keys(obj).find(key => obj[key].id === id);
}