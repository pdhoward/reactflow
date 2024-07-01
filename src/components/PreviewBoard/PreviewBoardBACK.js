import React, { useCallback, forwardRef, useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from "reactflow";
import dagre from "dagre";

import Nodes from "./nodes";

import "reactflow/dist/style.css";
import "./index.css";

const LayoutFlow = forwardRef(({ layout, code }, ref) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

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

  useEffect(() => {
    const nodeInstance = new Nodes(typeof code === "string" ? JSON.parse(code) : {});
    const [newNodes, newEdges] = nodeInstance.getNodes();

    console.log("Generated nodes:", newNodes);
    console.log("Generated edges:", newEdges);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      newNodes,
      newEdges
    );

    console.log("Layouted nodes:", layoutedNodes);
    console.log("Layouted edges:", layoutedEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [code]);

  const [flowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, onEdgesChange] = useEdgesState(edges);

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
    <div
      ref={ref}
      style={{ width: "100%", height: "calc(100% - 30px)" }}
      className="layoutflow"
    >
      <div style={{ width: "100%", height: "100%" }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
          />
          <Controls />
          <Background style={{ background: "#011627" }} color="#f97448" />
        </ReactFlowProvider>
      </div>
    </div>
  );
});

export default LayoutFlow;
