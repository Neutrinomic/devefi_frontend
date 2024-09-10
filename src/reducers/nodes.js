import { createSlice } from '@reduxjs/toolkit';
import { getBlast } from '../icblast.js';
import { toState } from '@infu/icblast';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { produce } from 'immer';
import { update } from 'autosize';
import account from './account.js';

const initialState = {
  factories: [],
  my: {},
  ledgers: {
    ic: {
      "ryjl3-tyaaa-aaaaa-aaaba-cai": { symbol: "ICP" },
      "f54if-eqaaa-aaaaq-aacea-cai": { symbol: "NTN" }
    }
  },
  canvas: {

  },
  next_canvas_id: 0,
  current_canvas_id: 0,
};


const newCanvasInner = (state, action) => {
  state.current_canvas_id = state.next_canvas_id;
  state.canvas[state.current_canvas_id] = {
    name: "New Canvas",
    nodes: [],
    edges: [],
    next_edge_id: 0
  };
  state.next_canvas_id++;

}

const canvasAddEdgeInternal = (state, action) => {
  // Check if already on canvas, source, sourceHandle, target, targetHandle
  let edge = action.payload.edge;
  if (state.canvas[state.current_canvas_id].edges.find(e => e.source === edge.source && e.sourceHandle === edge.sourceHandle && e.target === edge.target && e.targetHandle === edge.targetHandle)) {
    return;
  }

  state.canvas[state.current_canvas_id].edges.push({ id: state.canvas[state.current_canvas_id].next_edge_id, ...action.payload.edge });
  state.canvas[state.current_canvas_id].next_edge_id++;
};

const refreshEdgesInternal = (state) => {


  state.canvas[state.current_canvas_id].edges = [];

  // remove all account nodes 


  for (let node of state.canvas[state.current_canvas_id].nodes) {
    let factory = node.data.factory;
    if (node.type === "account") continue;
    let xnode = state.my[node.data.factory].find(n => n.id === node.data.node_id);

    let unused_targets = xnode.destinations.map((x, idx) => x.ic.account ? [JSON.stringify(x.ic.account), idx] : false).filter(Boolean)
    let used_targets = [];

    for (let node_to of state.canvas[state.current_canvas_id].nodes) {

      let from_idx = 0;

      for (let source of xnode.destinations) {
        let source_platform = Object.keys(source)[0];
        let source_principal = source[source_platform].ledger;
        let source_account = JSON.stringify(source[source_platform].account);
        let to_idx = 0;

        if (node_to.type === "account") {
          if (source_account === node_to.id) {
            let edge = {
              type: "smoothstep",
              source: node.id,
              sourceHandle: "output-" + from_idx,
              target: node_to.id,
              targetHandle: "input-0",
              animated: true,
              markerEnd: {
                type: 'arrow',
                width: 30,
                height: 30
              },
            };

            canvasAddEdgeInternal(state, { payload: { edge } })
          }
          continue
        };

        let xnode_to = state.my[node_to.data.factory].find(n => n.id === node_to.data.node_id);


        for (let destination of xnode_to.sources) {

          let destination_platform = Object.keys(destination)[0];
          let destination_principal = destination[destination_platform].ledger;
          let destination_account = JSON.stringify(destination[destination_platform].account);

          if (source_account === destination_account) {
            console.log("match", source_account, JSON.stringify(unused_targets));
            unused_targets = unused_targets.filter(x => x[0] !== destination_account);
            used_targets.push(destination_account);
            console.log("after", JSON.stringify(unused_targets));

            let edge = {
              type: "smoothstep",
              source: node.id,
              sourceHandle: "output-" + from_idx,
              target: node_to.id,
              targetHandle: "input-" + to_idx,
              animated: true,
              markerEnd: {
                type: 'arrow',
                width: 30,
                height: 30
              },
            };

            canvasAddEdgeInternal(state, { payload: { edge } })
          }

          to_idx++;
        }
        from_idx++;
      }



    }

    console.log({ unused_targets });

    for (let target of unused_targets) {
      canvasAddNodeInternal(state, {
        payload: {

          id: target[0],
          type: "account",
          position: { x: 100, y: 100 * state.canvas[state.current_canvas_id].nodes.length },
          data: {

          }
        }
      });
    }

    // Remove all account nodes that have vectors deployed to them
    for (let used_target of used_targets) {
      state.canvas[state.current_canvas_id].nodes = state.canvas[state.current_canvas_id].nodes.filter(n => n.id !== used_target || n.type === "vector");
    }}

    // Remove account nodes without edges to them
    // state.canvas[state.current_canvas_id].nodes = state.canvas[state.current_canvas_id].nodes.filter(n => {
    //   if (n.type === "account") {
    //     return state.canvas[state.current_canvas_id].edges.find(e => e.target === n.id) || state.canvas[state.current_canvas_id].edges.find(e => e.source === n.id);
    //   } else {
    //     return true;
    // }})
};

const canvasAddNodeInternal = (state, action) => {
  // dont add if already on canvas
  if (state.canvas[state.current_canvas_id].nodes.find(n => n.id === action.payload.id)) {
    return;
  }
  state.canvas[state.current_canvas_id].nodes.push(action.payload);
};


const refreshCanvasNodesInternal = (state) => {
  for (let node of state.canvas[state.current_canvas_id].nodes) {
    let factory = node.data.factory;
    if (node.type === "account") continue;
    let xnode = state.my[node.data.factory].find(n => n.id === node.data.node_id);
    let node_type = Object.keys(xnode.custom)[0];
    let node_meta = state.factories.find(f => f[0] === factory)[1].find(n => n.id === node_type);
    node.data.label = node_meta.name;
    node.data.governed = node_meta.governed_by;
    node.data.input_ports = xnode.sources.map(x => {
      let platform = Object.keys(x)[0];
      let principal = x[platform].ledger;
      let account = x[platform].account;
      return ({ type: state.ledgers[platform]?.[principal]?.symbol || "...", desc: '' })
    });
    node.data.output_ports = xnode.destinations.map(x => {
      let platform = Object.keys(x)[0];
      let principal = x[platform].ledger;
      let account = x[platform].account;
      return ({ type: state.ledgers[platform]?.[principal]?.symbol || "...", desc: '' })
    });
  }
}

export const nodeSlice = createSlice({
  name: 'nodes',
  initialState,
  reducers: {
    changeCanvasTo: (state, action) => {
      state.current_canvas_id = action.payload;
      refreshEdgesInternal(state);
    },
    canvasEdgeChange: (state, action) => {
      state.canvas[state.current_canvas_id].edges = applyEdgeChanges(action.payload.changes, state.canvas[state.current_canvas_id].edges)
    },
    canvasNodeChange: (state, action) => {
      state.canvas[state.current_canvas_id].nodes = applyNodeChanges(action.payload.changes, state.canvas[state.current_canvas_id].nodes)
      refreshEdgesInternal(state);
    },

    canvasAddEdge: canvasAddEdgeInternal,

    refreshEdges: refreshEdgesInternal,
    setFactories: (state, action) => {
      state.factories = action.payload;
    },

    setNodes: (state, action) => {
      state.my[action.payload.factory] = action.payload.nodes;
    },
    updateNode: (state, action) => {
      let factory = action.payload.factory;
      let node = action.payload.node;
      let idx = state.my[factory].findIndex(n => n.id === node.id);
      state.my[factory][idx] = node;
      refreshCanvasNodesInternal(state);
      refreshEdgesInternal(state);
    },
    addNodes: (state, action) => {
      if (!state.my[action.payload.factory]) {
        state.my[action.payload.factory] = [];
      }
      state.my[action.payload.factory].push(...action.payload.nodes);
    },
    deleteNodes: (state, action) => {
      delete state.my[action.payload.factory];
    },
    newCanvas: newCanvasInner,
    addNodeToCanvas: (state, action) => {
      if (state.next_canvas_id == 0) {
        newCanvasInner(state);
      }
      let id = action.payload.id;
      let factory = action.payload.factory;

      let node = state.my[factory].find(n => n.id === id);
      let node_type = Object.keys(node.custom)[0];
      let node_meta = state.factories.find(f => f[0] === factory)[1].find(n => n.id === node_type);

      // Check if already on canvas
      if (state.canvas[state.current_canvas_id].nodes.find(n => n.id === factory + "-" + node.id)) {
        return;
      }

      let xnode = {
        id: factory + "-" + node.id,
        type: "vector",
        position: { x: 100, y: 100 * state.canvas[state.current_canvas_id].nodes.length },
        data: {
          factory,
          node_id: node.id,
          label: node_meta.name,
          governed: node_meta.governed_by,
          input_ports: node.sources.map(x => {
            let platform = Object.keys(x)[0];
            let principal = x[platform].ledger;
            let account = x[platform].account;
            return ({ type: state.ledgers[platform]?.[principal]?.symbol || "...", desc: '' })
          }),
          output_ports: node.destinations.map(x => {
            let platform = Object.keys(x)[0];
            let principal = x[platform].ledger;
            let account = x[platform].account;
            return ({ type: state.ledgers[platform]?.[principal]?.symbol || "...", desc: '' })
          })
        }
      };
      state.canvas[state.current_canvas_id].nodes.push(xnode);

      // find if there are edges between nodes by comparing source and destination accounts

      refreshEdgesInternal(state);


    }
  },
});


export const { changeCanvasTo, setFactories, refreshEdges, updateNode, canvasAddEdge, setNodes, deleteNodes, addNodes, newCanvas, addNodeToCanvas, canvasNodeChange, canvasEdgeChange } = nodeSlice.actions;

export const canvasEdgeChangePromise = ({ changes }) => async (dispatch, getState) => {
  const state = getState();

  for (let change of changes) {
    if (change.type === 'remove') {
      // remove only if it's currently selected edge
      
      let cur_edge = state.nodes.canvas[state.nodes.current_canvas_id].edges.filter(e => e.id !== change.id);
      if (cur_edge.selected === true) {
      
      let id = change.id;

      let edge = state.nodes.canvas[state.nodes.current_canvas_id].edges.find(e => e.id === id);
      // get source node and remove destination remotely
      let sourceNode = state.nodes.canvas[state.nodes.current_canvas_id].nodes.find(node => node.id === edge.source);
      let realNode = state.nodes.my[sourceNode.data.factory].find(n => n.id === sourceNode.data.node_id);
      console.log({ sourceNode, realNode });

      let blast = getBlast();
      let source_can = await blast.ic(sourceNode.data.factory);
      let destinations = produce(realNode.destinations, draft => {
        let source_port_id = parseInt(edge.sourceHandle.split('-')[1]);
        draft[source_port_id].ic.account = null;
      });
      let modified_node_resp = await source_can.icrc55_modify_node(sourceNode.data.node_id, {
        destinations,
        refund: realNode.refund,
        controllers: realNode.controllers,
      }, null)
      let modified_node = toState(modified_node_resp.ok);
      console.log({ modified_node });

      //apply modification
      dispatch(updateNode({ factory: sourceNode.data.factory, node: modified_node }))
      }

    }
  }

  let new_changes = changes.filter(x => x.type !== 'remove');

  dispatch(canvasEdgeChange({ changes: new_changes }));
};

export const canvasOnConnect = (params) => async (dispatch, getState) => {

  let state = getState();
  let nodes = state.nodes.canvas[state.nodes.current_canvas_id].nodes;
  let edges = state.nodes.canvas[state.nodes.current_canvas_id].edges;

  const sourceNode = nodes.find(node => node.id === params.source);
  const targetNode = nodes.find(node => node.id === params.target);

  // Get the source and target port types
  let source_port_id = parseInt(params.sourceHandle.split('-')[1]);
  const sourcePortType = sourceNode.data.output_ports[source_port_id].type;
  let target_port_id = parseInt(params.targetHandle.split('-')[1]);
  const targetPortType = targetNode.data.input_ports[target_port_id].type;

  // Prevent multiple connections from the same output port
  const isOutputAlreadyConnected = edges.some(edge => edge.source === params.source && edge.sourceHandle === params.sourceHandle);

  // Enforce port type matching
  const isSamePortType = sourcePortType === targetPortType;

  if (isOutputAlreadyConnected) {
    console.log("Output port is already connected. Connection rejected.");
    return false; // No change
  }

  if (!isSamePortType) {
    console.log(`Cannot connect ${sourcePortType} to ${targetPortType}. Connection rejected.`);
    return false; // No change
  }

  let source_node = state.nodes.my[sourceNode.data.factory].find(n => n.id === sourceNode.data.node_id);
  let destination_node = state.nodes.my[targetNode.data.factory].find(n => n.id === targetNode.data.node_id);

  let blast = getBlast();
  let source_can = await blast.ic(sourceNode.data.factory);
  console.log(params);

  console.log({ source_node, destination_node, source_port_id, target_port_id })

  let destinations = produce(source_node.destinations, draft => {
    draft[source_port_id].ic.account = destination_node.sources[target_port_id].ic.account;
  });

  console.log({ destinations });
  let modified_node_resp = await source_can.icrc55_modify_node(sourceNode.data.node_id, {
    destinations,
    refund: source_node.refund,
    controllers: source_node.controllers,
  }, null)
  let modified_node = toState(modified_node_resp.ok);
  console.log({ modified_node });

  //apply modification
  dispatch(updateNode({ factory: sourceNode.data.factory, node: modified_node }));

  //dispatch(canvasAddEdge({ edge: params }));
}

export const fetchFactories = () => async dispatch => {
  let blast = getBlast();
  let v = await blast.reg.get_vectors();
  dispatch(setFactories(toState(v)));
}

export const fetchUserVectors = () => async (dispatch, getState) => {
  let blast = getBlast();
  let state = getState();
  for (let factory of state.nodes.factories) {
    console.log("--fetchUserFactoryVectors", factory);
    await dispatch(fetchUserFactoryVectors(factory[0]));
  }
}


export const fetchUserFactoryVectors = (factory) => async (dispatch, getState) => {
  console.log("fetchUserFactoryVectors", factory);
  let blast = getBlast();
  let can = await blast.ic(factory);

  let nodes = await can.icrc55_get_controller_nodes({ id: blast.me, start: 0, length: 500 });
  if (nodes.length == 0) {
    dispatch(deleteNodes({ factory }));
  } else {

    dispatch(setNodes({ factory: toState(factory), nodes: toState(nodes) }));
  }
};

export const createNode = (factory, req, creq) => async (dispatch, getState) => {
  let blast = getBlast();
  let can = await blast.ic(factory);
  console.log({ factory, req, creq });
  let new_node_resp = await can.icrc55_create_node(req, creq);

  let new_node = toState(new_node_resp.ok)
  dispatch(addNodes({ factory, nodes: [new_node] }));
  dispatch(addNodeToCanvas({ factory, id: new_node.id }));
};

export default nodeSlice.reducer;