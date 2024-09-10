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
import { AddIcon, ArrowForwardIcon, CheckIcon } from "@chakra-ui/icons"
import { useBlast } from "../icblast"
import { toState } from "@infu/icblast";
import { useDispatch } from "react-redux"
import {createNode} from "../reducers/nodes"

export function ModalOpen({ onClose }) {

    const blast = useBlast()
    const dispatch = useDispatch();
    let [factories, setFactories] = useState([]);
    const toast = useToast();
    const toastIdRef = React.useRef()

    async function load() {
        let v = await blast.reg.get_vectors();
        setFactories(toState(v));
    };
    useEffect(() => {
        load();
    }, []);


    async function create(factory, typeid) {
        let custom = {
            throttle :{
                init : { ledger: "f54if-eqaaa-aaaaq-aacea-cai" },
                variables : {
                    interval_sec: {fixed: 5},
                    max_amount: {fixed: 5000000},
                    source_count: 2,
                    destination_count: 2
                }
            }
        };
        console.log({
            destinations:[],
            refund:[],
            controllers:[ blast.me ]
        })
        dispatch(createNode(factory, {
            destinations:[],
            refund:[],
            controllers:[ blast.me ]
        }, custom))
    }

    // {"id":"throttle","name":"Throttle","description":"Send X tokens every Y seconds","supported_ledgers":[{"ic":"ryjl3-tyaaa-aaaaa-aaaba-cai"},{"ic":"f54if-eqaaa-aaaaq-aacea-cai"}],"pricing":"1 NTN","governed_by":"Neutrinite DAO"}

    return <ModalContent >
        <ModalHeader>Create vector</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
            {
                factories.map(([cid, vectors], i) => vectors.map((v, j) => <Box key={i} p={2} bg="gray.900" borderRadius="8" mb={2}>
                    <Stack>
                        
                        <Box>{v.name}</Box>
                        <Box>{v.governed_by}</Box>
                        <Box>{v.description}</Box>
                        <Box>{v.pricing}</Box>
                        <Box color="gray.500">Factory: {cid}</Box>
                        <Box><Button onClick={() => create(cid, v.id)}>Create</Button></Box>
                    </Stack>
                </Box>))

            }
        </ModalBody>
    </ModalContent>
}

export function NewVector() {

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
            <IconButton onClick={onOpen} icon={<AddIcon />} w={"50px"} h={"50px"} colorScheme={"blue"} />

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
