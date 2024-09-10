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
import { createNode, addNodeToCanvas} from "../reducers/nodes"

export function ModalOpen({ onClose }) {

    const blast = useBlast()
    const dispatch = useDispatch();
    const toast = useToast();
    const toastIdRef = React.useRef()

    const factories = useSelector(s => s.nodes.factories);
    const my_node_factories = useSelector(s => s.nodes.my);

    let all_nodes = [];

    Object.keys(my_node_factories).forEach(factory_id => {
        
        let my_nodes = my_node_factories[factory_id];
        let f_meta_types = factories.find(f => f[0] === factory_id)[1];
        

        my_nodes.forEach(node => {
            let my_type = Object.keys(node.custom)[0];
            let f_meta = f_meta_types.find(n => n.id === my_type);
            all_nodes.push({
                type: my_type,
                factory: factory_id,
                name: f_meta.name,
                id: node.id,
            });
        })
    })



    return <ModalContent >
        <ModalHeader>Add vector to canvas</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
            {
                all_nodes.map(node => (
                    <Box key={node.id} p={2} bg="gray.900" borderRadius="8" mb={2} onClick={() => dispatch(addNodeToCanvas({factory: node.factory, id:node.id}))}>
                        <Flex>
                                
                                <Text>{node.name}</Text>
                                <Text ml="2">{node.id}</Text>
                                <Spacer />
                                <Text color="gray.600">{node.factory}</Text>

                            {/* <IconButton  icon={<AddIcon />} /> */}
                        </Flex>
                    </Box>

                ))

            }
        </ModalBody>
    </ModalContent>
}

export function AddVector() {

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
            <IconButton onClick={onOpen} icon={<DownloadIcon />} w={"50px"} h={"50px"} colorScheme={"blue"} />

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
