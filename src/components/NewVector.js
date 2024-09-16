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
import { Pylon, FactoryTypeIcon } from './Pylon';
import { Routes, Route, Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';

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
    <OverviewFactory factory={factory} />
    <Box pt="4">
      {
        factories.map(([cid, meta], i) => cid == factory ? meta.nodes.map((v, j) => (
          <Link to={v.id} key={v.id}><Box
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
            <HStack spacing={4}><Box><FactoryTypeIcon factory={cid} type_id={v.id} width={"50px"} /></Box>

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

function OverviewFactory({ factory }) {
  let factories = useSelector(s => s.nodes.factories);
  let x = factories.find(([cid]) => cid === factory)?.[1];
  return <Link to="../"><Box bg="gray.900" borderRadius="5" borderColor="gray.700" mb={3} p="2">
    <HStack><Box pl="3" pr="3" pt="2" pb="2"><Pylon id={factory} width="50px" /></Box><Box fontWeight="bold">{x.name}</Box><Box color="gray.500">{x.governed_by}</Box></HStack>
  </Box></Link>
}

function OverviewFactoryType({ factory, type_id }) {
  let factories = useSelector(s => s.nodes.factories);

  const x = factories
    .find(([cid]) => cid === factory)?.[1].nodes
    .find(v => v.id === type_id);
  return <Link to={"../"+factory}><Box bg="gray.900" borderRadius="5" borderColor="gray.700" mb={3}>
  <HStack><Box pl="5" pr="2"><FactoryTypeIcon factory={factory} type_id={type_id}  width="50px"/></Box>
    <Stack spacing={3} p="2">
      <Text fontSize="2xl" fontWeight="bold" color="white">{x.name}</Text>
      <Text color="gray.400">{x.description}</Text>
      <Text fontSize="sm" color="teal.300" fontWeight="medium">{`Pricing: ${x.pricing}`}</Text>
    </Stack>
    </HStack>
  </Box></Link>

}

function CreateForm() {
  let { factory, type_id } = useParams();
  let factories = useSelector(s => s.nodes.factories);
  const navigate = useNavigate();
  const blast = useBlast()

  const dispatch = useDispatch();

  async function onClose() {
    navigate("../");
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

    onClose();
  }


  return <Box>
    <OverviewFactory factory={factory} />
    <OverviewFactoryType factory={factory} type_id={type_id} />

    <CreateRequest onClose={() => onClose()} key={factory + "." + type_id} factory={factory} type_id={type_id} onSubmit={(data) => create(factory, type_id, data)} /></Box>
}

function ListFactories() {
  let factories = useSelector(s => s.nodes.factories);

  return <Box pt="4">
    <Stack spacing="2">
      {factories.map(([cid, meta], i) => {
        return <Link to={cid + "/"} key={cid}><Box bg="gray.900"
          p="4"
          borderRadius="12"
          mb={4}
          boxShadow="lg"
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{ transform: "scale(0.98)", boxShadow: "xl", bg: "gray.700" }}><HStack ><Pylon id={cid} width="50px" /><Box fontWeight="bold">
            {meta.name}</Box><Box>{meta.nodes.length} types</Box><Box color="gray.500">{meta.governed_by}</Box></HStack></Box></Link>
      })}</Stack></Box>


}