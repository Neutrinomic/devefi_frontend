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
import { useDispatch, useSelector } from "react-redux"
import { createNode } from "../reducers/nodes"

import { CreateRequest } from "./Request";
import { Pylon, Factoryicon } from './Pylon';
import { Routes, Route, Outlet, Link, useLocation, useParams } from 'react-router-dom';

export function NewVector({ onClose }) {

  const blast = useBlast()
  const dispatch = useDispatch();
  const toast = useToast();
  const toastIdRef = React.useRef();


  return <Box><Routes>
    <Route index element={<ListFactories />} />
    <Route path=":factory/" element={<SelectType />} />
    <Route path=":factory/:type_id" element={<CreateForm />} />
  </Routes>

    <Outlet />
  </Box>

}

function SelectType() {
  let factories = useSelector(s => s.nodes.factories);

  let { factory } = useParams();

  return <Box>
    <Box>
      <HStack><Pylon id={factory} width="50px" /><Box>Transcendence Alpha</Box><Box>Neutrinite DAO</Box></HStack>
    </Box>
    <Box pt="4">
      {
        factories.map(([cid, vectors], i) => cid == factory ? vectors.map((v, j) => (
          <Link to={v.id}><Box
            key={`${i}-${j}`}
            p={4}
            bg="gray.900"
            borderRadius="12"
            mb={4}
            boxShadow="lg"
            cursor="pointer"
            transition="all 0.3s ease"
            _hover={{ transform: "scale(0.98)", boxShadow: "xl", bg: "gray.700" }}
          >
            <HStack spacing={4}><Box><Factoryicon id={cid + "-" + v.id} width={"50px"} /></Box>

              <Stack spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color="white">{v.name}</Text>
                <Text color="gray.400">{v.description}</Text>
                <Text fontSize="sm" color="teal.400" fontWeight="medium">{`Pricing: ${v.pricing}`}</Text>
              </Stack>
            </HStack>
          </Box></Link>

        )) : null)
      }
    </Box></Box>
}

function CreateForm() {
  let { factory, type_id } = useParams();
  let factories = useSelector(s => s.nodes.factories);

  const blast = useBlast()

  const dispatch = useDispatch();

  async function onCreated() {

  };

  async function create(factory, typeid, data) {
    let custom = {
      [typeid]: data
    };

    await dispatch(createNode(factory, {
      destinations: [],
      refund: [],
      controllers: [blast.me]
    }, custom))

    onCreated();
  }

  const x = factories
    .find(([cid]) => cid === factory)?.[1]
    .find(v => v.id === type_id);

  return <Box>
    <Box bg="gray.900" borderBottom="2px solid" borderColor="gray.700" mb={6}>
      <Stack spacing={3} p="6">
        <Text fontSize="2xl" fontWeight="bold" color="white">{x.name}</Text>
        <Text fontSize="lg" color="gray.300" fontStyle="italic">{x.governed_by}</Text>
        <Text color="gray.400">{x.description}</Text>
        <Text fontSize="sm" color="teal.300" fontWeight="medium">{`Pricing: ${x.pricing}`}</Text>
        <Text fontSize="sm" color="gray.500">{`Factory ID: ${factory}`}</Text>
      </Stack>
    </Box>

    <CreateRequest onClose={() => onCreated()} key={factory + "." + type_id} factory={factory} type_id={type_id} onSubmit={(data) => create(factory, type_id, data)} /></Box>
}

function ListFactories() {
  let factories = useSelector(s => s.nodes.factories);

  return <Box pt="4">
    <Stack spacing="2">
      {factories.map(([cid, vectors], i) => {
        return <Link to={cid + "/"}><Box key={cid} bg="gray.900"
          p="4"
          borderRadius="12"
          mb={4}
          boxShadow="lg"
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{ transform: "scale(0.98)", boxShadow: "xl", bg: "gray.700" }}><HStack ><Pylon id={cid} width="50px" /><Box>
            Transcendence Alpha</Box><Box>Neutrinite DAO</Box></HStack></Box></Link>
      })}</Stack></Box>


}