import ReactFlow, { Handle, Position, Controls, MiniMap, Background, useNodesState, applyNodeChanges, useEdgesState, addEdge, Panel } from 'reactflow';
import styled from '@emotion/styled'
import { useCallback, useMemo, useEffect } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { produce } from "immer"
import 'reactflow/dist/style.css';



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


export function Designer() {
  const nodeTypes = useMemo(() => ({ vector: VectorNode, account: AccountNode }), []);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);


  useEffect(() => {

    const onDirectionChange = (id, dir) => {
      setNodes((nds) => produce(nds, draft => {
        draft.find(n => n.id === id).data.direction = dir
      }));
    };

    const initialNodes = [
      { id: '1', type: "vector", dragHandle: '.dragh', position: { x: 0, y: 0 }, data: { label: '1', onDirectionChange } },
      { id: '2', type: "vector", dragHandle: '.dragh', position: { x: 0, y: 100 }, data: { label: '2', onDirectionChange } },
      { id: '3', type: "account", dragHandle: '.dragh', position: { x: 0, y: 400 }, data: { label: 'ICP' } },
      { id: '4', type: "account", dragHandle: '.dragh', position: { x: 0, y: 500 }, data: { label: 'ckBTC' } },
      { id: '5', type: "account", dragHandle: '.dragh', position: { x: 0, y: 500 }, data: { label: 'ckETH' } },
      { id: '6', type: "account", dragHandle: '.dragh', position: { x: 0, y: 500 }, data: { label: 'NTN' } },
    ];

    const initialEdges = [{ id: 'e1-2', source: '1', target: '2', type: 'smoothstep' }];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [])


  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => {

      return addEdge(params, eds)
    })
    ,
    [setEdges],
  );

  return <ReactFlow nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    nodeTypes={nodeTypes}
    onEdgesChange={onEdgesChange}
    onConnect={onConnect}
    defaultEdgeOptions={{ type: "smoothstep", animated: true, markerEnd: { type: "arrow", width: 30, height: 30 } }}
    deleteKeyCode={["Backspace", "Delete"]}
  >
    <ControlsStyled />
    <MiniMapStyled />
    <Panel position="top-right">top-right</Panel>
    <Background variant="dots" gap={12} size={1} color="var(--chakra-colors-gray-700)" />
  </ReactFlow>

}


function VectorNode({ id, data }) {
  return <>

    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Left} />

    <Box className="dragh">Drag</Box>

    <Box w="100px" h="100px" bg="gray.600" cursor="pointer">{data.label}</Box>
  </>
}

function AccountNode({ data }) {
  return <>
    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Left} />
    <Box className="dragh">Drag</Box>
    <Box w="100px" h="100px" bg="gray.600" cursor="pointer">{data.label}</Box>
  </>
}