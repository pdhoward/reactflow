import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  MiniMap, 
  Controls,
  ConnectionLineType,
  Background,
  ReactFlowProvider
} from 'reactflow';
import dagre from "dagre";
import 'reactflow/dist/style.css';
import Nodes from "./nodes";

import ColorSelectorNode from './ColorSelectorNode';

import './index.css';

const initBgColor = '#1A192B';

const connectionLineStyle = { stroke: '#fff' };
const snapGrid = [20, 20];
const nodeTypes = {
  selectorNode: ColorSelectorNode,
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const LayoutFlow = forwardRef(({layout, code}, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [bgColor, setBgColor] = useState(initBgColor);

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 272;
  const nodeHeight = 76;

  const getLayoutedElements = (nodes, edges, direction = "TB") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? "left" : "top";
      node.sourcePosition = isHorizontal ? "right" : "bottom";

      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    });

    return { nodes, edges };
  };

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );

  
  const onLayout = useCallback(
    (direction) => {
      const nodeInstance = new Nodes(typeof code === "string" ? JSON.parse(code) : {});
      const [newNodes, newEdges] = nodeInstance.getNodes();
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(newNodes, newEdges, direction);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    },
    [code]
  );

  useEffect(() => {
    if (layout) {
      onLayout(layout);
      console.log("called ", layout);
    }
  }, [layout, onLayout]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      style={{ background: bgColor }}
      nodeTypes={nodeTypes}
      connectionLineStyle={connectionLineStyle}
      snapToGrid={true}
      snapGrid={snapGrid}
      defaultViewport={defaultViewport}
      fitView
      attributionPosition="bottom-left"
    >
      <MiniMap
        nodeStrokeColor={(n) => {
          if (n.type === 'input') return '#0041d0';
          if (n.type === 'selectorNode') return bgColor;
          if (n.type === 'output') return '#ff0072';
        }}
        nodeColor={(n) => {
          if (n.type === 'selectorNode') return bgColor;
          return '#fff';
        }}
      />
      <Controls />
    </ReactFlow>
  );
})

export default LayoutFlow;
