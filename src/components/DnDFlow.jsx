import React, { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from './Sidebar';

import '../index.css';
import { nodeTypes } from '../utils';
import NodeDataEditor from './NodeDataEditor';
import { cloneDeep } from 'lodash';

const initialNodes = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { text: `Test Message ${nodes.length+1}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance,nodes],
  );
  
  const isValidFlow = () => {
    const nodesWithoutEdges = [];
      nodes.forEach((node) => {
        const connectedEdges = edges.filter((edge) => 
          edge.source === node.id 
          || edge.target === node.id
        );
        if (connectedEdges.length === 0) {
          nodesWithoutEdges.push(node.id);
        }
      });
    return !Boolean(nodesWithoutEdges.length);
  }

  const onSave = () => {
    if(!isValidFlow()){
      alert('Cannot Save Flow')
      return
    }
    alert('Flow Saved')
    //do what we want to do on save
  }

  const isAnyNodeSelected = nodes.some(node => node.selected)

  const onUnSelectNode = () => {
    const currentNodes = cloneDeep(nodes)
    const updatedNodes = currentNodes.map(node => ({
      ...node,
      selected: false
    }))
    setNodes(updatedNodes)
  }

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            nodeTypes={nodeTypes}
          >
            <Controls />
          </ReactFlow>
        </div>
        <div style={{display:'flex', flexDirection:'column', minWidth: "20%"}}>
          <button className='save-btn' onClick={onSave}>save changes</button>
          {!isAnyNodeSelected
            ? <Sidebar />
            : <NodeDataEditor 
                nodes={nodes}
                setNodes={setNodes}
                onSave={onSave}
                onUnSelectNode={onUnSelectNode}
              />
          }
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default DnDFlow;
