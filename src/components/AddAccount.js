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
import { AddIcon, ArrowForwardIcon, CheckIcon, DownloadIcon} from "@chakra-ui/icons"
import { useBlast } from "../icblast"
import { toState } from "@infu/icblast";
import { useDispatch, useSelector } from "react-redux"
import {  addUserAccountToCanvas} from "../reducers/nodes"
import {InputAccount} from "./Transfer";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";

export function AddAccount({ onClose }) {

    const blast = useBlast()
    const dispatch = useDispatch();
    const toast = useToast();
    const toastIdRef = React.useRef()
    let [acc, setAcc] = useState(null);


    return <Box p="2">
        
             <InputAccount onChange={setAcc} />
             <Button onClick={() => {
                // console.log(encodeIcrcAccount(acc.account))
                dispatch(addUserAccountToCanvas(encodeIcrcAccount(acc.account)))
             }}>Add</Button>
        </Box>
}
