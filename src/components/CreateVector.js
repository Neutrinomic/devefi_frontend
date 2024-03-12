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
import { ledgers } from "../ledgers_cfg"
import { InputAccount } from "./Transfer"
import { AddIcon, ArrowForwardIcon, CheckIcon } from "@chakra-ui/icons"
import { Algo_v1 } from "./algo/Algo_v1"
import { useBlast } from "../icblast"
import { produce } from "immer"

export function ModalOpen({ onClose }) {

    const blast = useBlast()
    const [agree, setAgree] = React.useState(false)
    const toast = useToast();
    const toastIdRef = React.useRef()
    const [disableButton, setDisableButton] = React.useState(false)

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
                max: 0.0004,
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

    useEffect(() => {
        const load = async () => {
            let p = await blast.dfv.get_vector_price();
            setPrices(p.ok);
        };
    
        // Call load immediately and then set up the interval
        load();
        const intervalId = setInterval(load, 5000); // 5000 milliseconds = 5 seconds
    
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    const createSend = async (paymentCurrency) => {
        setDisableButton(paymentCurrency)
        if (prompt("Test mode. Provide password to continue") !== "anvil") {
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
        
   
        let rez = await blast.dfv.create_vector(vector, { [paymentCurrency]: null })

        if (rez.err) {
            toast.update(toastIdRef.current, { status: 'error', title: "Error", description: rez.err, duration: 5000, isClosable: true })
        } else {
            toast.update(toastIdRef.current, { title: "Success", status: 'success', duration: 2000, isClosable: true })
        }

        }  catch (e) {
            console.log(e)
            
        }
        setDisableButton(false)
        onClose();
    }


    return <ModalContent >
        <ModalHeader>Create a single vector</ModalHeader>
        <Box mt="-54px" textAlign="center"><ArrowForwardIcon w={"80px"} h={"80px"} color={"gray.600"} /></Box>
        <ModalCloseButton />
        <ModalBody pb={6}>
            <Stack>
                <HStack>
                    <FormControl>
                        <FormLabel>Source ledger <Text as="span" size="sm" color="orange.500">(<Explain label={"Can't be changed later"}>permanent</Explain>)</Text></FormLabel>
                        <Select isRequired value={vector.source.ledger} onChange={set((e, x) => { x.source.ledger = e.target.value; x.source.ledger_symbol = findKeyById(ledgers, e.target.value) })} placeholder='Select token'>{Object.keys(ledgers).map(symbol => ledgers[symbol].vectors?<option key={symbol} value={ledgers[symbol].id}>{symbol}</option>:null).filter(Boolean)}
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Destination ledger <Text as="span" size="sm" color="orange.500">(permanent)</Text></FormLabel>
                        <Select isRequired value={vector.destination.ledger} onChange={set((e, x) => { x.destination.ledger = e.target.value; x.destination.ledger_symbol = findKeyById(ledgers, e.target.value) })} placeholder='Select token'>{Object.keys(ledgers).map(symbol => ledgers[symbol].vectors?<option key={symbol} value={ledgers[symbol].id}>{symbol}</option>:null).filter(Boolean)}
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

            <Box mt="20px"><Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>I agree to the TOS and that my vector will be <Explain label={"Removed from volume statistics"}>muted</Explain> or <Explain label={"Not allowed to trade"}>suspended</Explain> if it engages in market manipulation</Checkbox></Box>

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