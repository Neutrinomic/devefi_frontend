import { ReactFlow, Handle, Position, Controls, MiniMap, Background, useNodesState, applyNodeChanges, useEdgesState, addEdge, Panel } from '@xyflow/react';
import styled from '@emotion/styled'
import { useCallback, useMemo, useEffect } from 'react';
import { Box, Button, Text, HStack, VStack, MenuIcon, IconButton } from '@chakra-ui/react';
import { produce } from "immer"
import '@xyflow/react/dist/style.css';
import { useSelector, useDispatch } from 'react-redux';
import { canvasNodeChange, canvasOnConnect, canvasEdgeChangePromise } from "../reducers/nodes"
import { Hashicon } from '@emeraldpay/hashicon-react';


const MiniMapStyled = styled(MiniMap)`
  background-color: var(--chakra-colors-gray-800);

  .react-flow__minimap-mask {
    fill: var(--chakra-colors-gray-900);
  }

  .react-flow__minimap-node {
    fill: var(--chakra-colors-gray-300);
    stroke: none;
  }
`;

const ControlsStyled = styled(Controls)`
  button {
    background-color: var(--chakra-colors-gray-900);
    color: var(--chakra-colors-gray-300);
    border-bottom: 1px solid var(--chakra-colors-gray-700);

    &:hover {
      background-color: var(--chakra-colors-gray-600);
    }

    path {
      fill: currentColor;
    }
  }
`;


export function Designer({ vecs }) {
  const nodeTypes = useMemo(() => ({ vector: VectorNode, account: AccountNode }), []);
  const dispatch = useDispatch();

  const canvas_id = useSelector(s => s.nodes.current_canvas_id);
  const canvas = useSelector(s => s.nodes.canvas?.[canvas_id]);

  const account_nodes = canvas?.account_nodes || [];
  const account_edges = canvas?.account_edges || [];

  let designer_nodes = canvas?.nodes || [];
  let designer_edges = canvas?.edges || [];
  // console.log(designer_nodes)
  //   console.log(account_nodes)
  designer_nodes = [...designer_nodes, ...account_nodes];
  designer_edges = [...designer_edges, ...account_edges];

  const onNodesChange = useCallback(
    (changes) => {

      dispatch(canvasNodeChange({ changes }));
    },
    [],
  );

  const onConnect = useCallback(
    async (params) => {
      await dispatch(canvasOnConnect(params))
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      dispatch(canvasEdgeChangePromise({ changes }));

    },
    [],
  );

  return <ReactFlow nodes={designer_nodes}
    maxZoom={1}
    minZoom={0.3}
    edges={designer_edges}
    onNodesChange={onNodesChange}
    nodeTypes={nodeTypes}
    onEdgesChange={onEdgesChange}
    onConnect={onConnect}

    // snapToGrid={true}
    // snapGrid={[45, 45]}
    defaultEdgeOptions={{ type: "smoothstep", animated: true, markerEnd: { type: "arrow", width: 30, height: 30 } }}
    deleteKeyCode={["Backspace", "Delete"]}
    fitView="auto"
  >
    <ControlsStyled />
    <MiniMapStyled style={{ bottom: 70 }} />

    <Background variant="dots" gap={12} size={1} color="var(--chakra-colors-gray-700)" />
  </ReactFlow>

}


function VectorNode({ id, data }) {
  const { input_ports, output_ports } = data;

  // Calculate the height of the node box based on the number of ports
  const boxHeight = Math.max(input_ports.length, output_ports.length) * 40 + 80;

  return (
    <div style={{ position: 'relative', width: '300px', height: `${boxHeight}px` }} className="vectornode">
      {/* Node label and additional line */}
      <Box className="dragh" style={{ position: 'absolute', top: 0, width: '100%' }}>
        <VStack spacing={0} p={5}>
          <Text fontSize="lg" color="white">
            {data.label}
          </Text>
          {data.governed ? <Text fontSize="sm" color="blue.300">
            {data.governed}
          </Text> : null}
        </VStack>
      </Box>

      {/* Ports display */}
      <Box sx={{ position: "relative" }} mt={"40px"}>


        {input_ports.map((input, index) => (
          <Box display="flex" alignItems="center" key={index} sx={{ position: "absolute", left: "20px", top: (index * 40) + "px" }}>
            <Handle type="target" id={`input-${index}`} position={Position.Left} />
            <Box ml={4} mt={"30px"}>
              <Text fontSize="lg" fontWeight="bold">{input.type}</Text>
              {input.desc && <Text fontSize="sm" color="gray.500">{input.desc}</Text>}
            </Box>
          </Box>
        ))}

        {output_ports.map((input, index) => (
          <Box display="flex" alignItems="center" key={index} sx={{ position: "absolute", right: "20px", top: (index * 40) + "px" }}>
            <Box mr={4} textAlign="right" mt={"30px"}>
              <Text fontSize="lg" fontWeight="bold">{output_ports[index]?.type}</Text>
              {output_ports[index]?.desc && <Text fontSize="sm" color="gray.500">{output_ports[index].desc}</Text>}
            </Box>
            <Handle type="source" id={`output-${index}`} position={Position.Right} />
          </Box>

        ))}

      </Box>
    </div>
  );
}
// function VectorNode({ id, data }) {
//   return     <div>

//     <Handle type="source" id="input1" position={Position.Right}  style={{ top: 50 }}/>
//     <Handle type="source" id="input2" position={Position.Right}  style={{ top: 90 }}/>

//     <Handle type="target" id="output1" position={Position.Left}  style={{ top: 50 }}/>
//     <Handle type="target" id="output2" position={Position.Left}  style={{ top: 90 }}/>


//     <Box className="dragh"></Box>

//     <Box w="100px" h="100px" bg="gray.600" cursor="pointer">{data.label}</Box>
//   </div>
// }

function AccountNode({ id, data }) {
  return <div style={{ position: 'relative', width: '100px', height: `100px` }}>
    
    <Box sx={{position:"absolute", top:"10px", left:"7px", opacity:0}}>
    <Handle type="target" id={"input-0"} position={Position.Left} />
    </Box>
    <Hashicon value={id} size={48} />
  
  </div>

}

function deepEqual(obj1, obj2) {
  // Check if both are objects
  if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
    // Get all keys of both objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // Check if they have the same number of keys
    if (keys1.length !== keys2.length) {
      return false;
    }

    // Check if all keys and values are equal
    for (let key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  } else {
    // If not objects, compare the values directly
    return obj1 === obj2;
  }
}