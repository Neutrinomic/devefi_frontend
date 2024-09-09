import  { ReactFlow, Handle, Position, Controls, MiniMap, Background, useNodesState, applyNodeChanges, useEdgesState, addEdge, Panel } from '@xyflow/react';
import styled from '@emotion/styled'
import { useCallback, useMemo, useEffect } from 'react';
import { Box, Button, Text, HStack, VStack } from '@chakra-ui/react';
import { produce } from "immer"
import '@xyflow/react/dist/style.css';



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


export function Designer({vecs}) {
  const nodeTypes = useMemo(() => ({ vector: VectorNode, account: AccountNode }), []);
  
  // console.log("Designer", vecs);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);


  useEffect(() => {

    const onDirectionChange = (id, dir) => {
      setNodes((nds) => produce(nds, draft => {
        draft.find(n => n.id === id).data.direction = dir
      }));
    };

    let idx = 0;
    const initialNodes = Object.keys(vecs).map(k => {
        idx++;
        return { id: k, type: "vector", dragHandle: '.dragh', position: { x: 100, y: 100 * idx}, data: { 
          label: "EXCHANGE", 
          governed: "NEUTRINITE",
          onDirectionChange,
          input_ports: [{ type: vecs[k].source.ledger_symbol, desc: 'in' }],
          output_ports: [{ type: vecs[k].destination.ledger_symbol, desc: 'out' }]
          // input_ports: [{ type: 'ICP', desc: 'input' }, { type: 'ckBTC' }],
          // output_ports: [{ type: 'ICP', desc: 'output' }, { type: 'ckBTC', desc: 'fee' }, { type: 'ckBTC', desc: 'fee' }],
         } }
      })
   

    console.log("initialNodes", initialNodes);
    const initialEdges = [
      // { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', sourceHandle: 'input1', targetHandle: 'output1' },
      // { id: 'x', source: '2', target: '1', type: 'smoothstep', sourceHandle: 'input1', targetHandle: 'output1' }
    ];

    for (let from in vecs) {

      let fromv = vecs[from];
      for (let to in vecs) {
        let tov = vecs[to];
        if (deepEqual(fromv.destination.address,tov.source.address)) {
          initialEdges.push({ id: from + "-" + to, source: from, target: to, type: 'smoothstep', sourceHandle: 'output-0', targetHandle: 'input-0' });
        }
      }
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [])


  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        // Get the source and target node
        const sourceNode = nodes.find(node => node.id === params.source);
        const targetNode = nodes.find(node => node.id === params.target);
  
        // Get the source and target port types
        const sourcePortType = sourceNode.data.output_ports[parseInt(params.sourceHandle.split('-')[1])].type;
        const targetPortType = targetNode.data.input_ports[parseInt(params.targetHandle.split('-')[1])].type;
  
        // Prevent multiple connections from the same output port
        const isOutputAlreadyConnected = eds.some(edge => edge.source === params.source && edge.sourceHandle === params.sourceHandle);
  
        // Enforce port type matching
        const isSamePortType = sourcePortType === targetPortType;
  
        if (isOutputAlreadyConnected) {
          console.log("Output port is already connected. Connection rejected.");
          return eds; // No change
        }
  
        if (!isSamePortType) {
          console.log(`Cannot connect ${sourcePortType} to ${targetPortType}. Connection rejected.`);
          return eds; // No change
        }
  
        // If all checks pass, add the edge
        return addEdge(params, eds);
      });
    },
    [setEdges, nodes],
  );

  return <ReactFlow nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    nodeTypes={nodeTypes}
    onEdgesChange={onEdgesChange}
    onConnect={onConnect}
    defaultEdgeOptions={{ type: "smoothstep", animated: true, markerEnd: { type: "arrow", width: 30, height: 30 } }}
    deleteKeyCode={["Backspace", "Delete"]}
    fitView="auto"
  >
    <ControlsStyled />
    <MiniMapStyled style={{ bottom: 70 }}/>
    <Panel position="top-right">top-right</Panel>
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
          {data.governed?<Text fontSize="sm" color="blue.300">
            {data.governed}
          </Text>:null}
        </VStack>
      </Box>

      {/* Ports display */}
      <VStack spacing={4} align="stretch" style={{ marginTop: '60px', height: `calc(100% - 60px)` }}>
        {input_ports.map((input, index) => (
          <HStack key={`port-${index}`} justifyContent="space-between" position="relative">
            {/* Input port */}
            <Box display="flex" alignItems="center">
              <Handle type="target" id={`input-${index}`} position={Position.Left} style={{ top: 0 }} />
              <Box ml={4}>
                <Text fontSize="lg" fontWeight="bold">{input.type}</Text>
                {input.desc && <Text fontSize="sm" color="gray.500">{input.desc}</Text>}
              </Box>
            </Box>

            {/* Output port */}
            <Box display="flex" alignItems="center">
              <Box mr={4} textAlign="right">
                <Text fontSize="lg" fontWeight="bold">{output_ports[index]?.type}</Text>
                {output_ports[index]?.desc && <Text fontSize="sm" color="gray.500">{output_ports[index].desc}</Text>}
              </Box>
              <Handle type="source" id={`output-${index}`} position={Position.Right} style={{ top: 0 }} />
            </Box>
          </HStack>
        ))}
      </VStack>
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

function AccountNode({ data }) {
  return <>
    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Left} />
    <Box className="dragh">Drag</Box>
    <Box w="100px" h="100px" bg="gray.600" cursor="pointer">{data.label}</Box>
  </>
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