import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Modal, Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
// import claim from '../data/data.json';
import dagre from 'dagre';
import ReactFlow, { MiniMap, Controls, Background, Handle, Position, BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import 'reactflow/dist/style.css';

const padWithDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.includes('T')) return timestamp;
    if (/^\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
        return `2000-01-01T${timestamp}`;
    }
    return timestamp;
};

const CustomNode = ({ data }) => {
    return (
        <div
            style={{
                ...data.style,  // Use the passed-in style
                padding: '12px 16px',
                border: '2px solid #0029F7',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontFamily: 'PT Serif',
                fontWeight: 800,
                minWidth: '150px',
                textAlign: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
        >
            <Tooltip title={data.tooltip} placement="top">
                {data.label}
            </Tooltip>

            {/* Handles for connecting edges */}
            <Handle type="target" position={Position.Top} style={{ background: '#0029F7' }} />
            <Handle type="source" position={Position.Bottom} style={{ background: '#0029F7' }} />
        </div>
    );
};


const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    const label = data?.label;  // Check if label exists

    return (
        <>
            <BaseEdge
                path={edgePath}
                id={id}
                markerEnd="url(#arrowhead)"
                style={{
                    stroke: '#0029F7',
                    strokeWidth: 2,
                    strokeDasharray: '5,5',
                    animation: 'dash 1s linear infinite',
                }}
            />
            <svg style={{ height: 0 }}>
                <defs>
                    <marker
                        id="arrowhead"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#0029F7" />
                    </marker>
                </defs>
            </svg>
            {/* Render label only if it's available */}
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            background: '#ffffff',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            border: '1px solid #0029F7',
                            color: '#0029F7',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'all',
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};


const ClaimDetails = () => {


    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('log');
    const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
    const { state } = location;
    const claimDetails = state?.data;
    console.log(claimDetails);
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        ranksep: 100, // vertical spacing
        nodesep: 80   // horizontal spacing
    });
    const nodeWidth = 250;
    const nodeHeight = 100; // Increased height for better readability

    const getLayoutedElements = (nodes, edges, direction = 'TB') => {
        dagreGraph.setGraph({ rankdir: direction });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        nodes.forEach((node) => {
            const { x, y } = dagreGraph.node(node.id);
            node.position = { x, y };
        });

        return { nodes, edges };
    };

    // Function to show the modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    // Function to hide the modal
    const hideModal = () => {
        setIsModalVisible(false);
    };

    const getAIPathSteps = (steps) => {
        const aiPathSteps = new Set();
        const stepMap = new Map();
        steps.forEach(step => stepMap.set(step.StepNumber, step));

        let current = "1.0"; // Starting node
        aiPathSteps.add(current);

        while (current && stepMap.has(current)) {
            const aiNext = stepMap.get(current).AIPath;
            if (aiNext) {
                aiPathSteps.add(aiNext);
                current = aiNext;
            } else {
                break;
            }
        }

        return aiPathSteps;
    };

    const buildGraphData = (steps) => {
        const nodes = [];
        const edges = [];
        const visited = new Set();
        const stepMap = new Map();
        const aiSteps = getAIPathSteps(steps);  // Get all AI path step numbers

        steps.forEach(step => stepMap.set(step.StepNumber, step));

        const traverse = (stepNumber) => {
            if (!stepNumber || visited.has(`${stepNumber}-in-process`)) return;
            visited.add(`${stepNumber}-in-process`);

            const step = stepMap.get(stepNumber);
            if (!step) return;

            // Add node with color logic based on AI path
            if (!nodes.find(n => n.id === String(step.StepNumber))) {
                nodes.push({
                    id: String(step.StepNumber),
                    type: 'custom',
                    data: {
                        label: (
                            <Tooltip title={step.StepDescription} placement="top">
                                {`Step ${step.StepNumber}`}
                            </Tooltip>
                        ),
                        style: {
                            backgroundColor: aiSteps.has(step.StepNumber) ? '#0029F7' : '#ccc',  // Blue for AI path, gray otherwise
                            color: aiSteps.has(step.StepNumber) ? 'white' : 'black',  // Text color: white for blue nodes, black for gray nodes
                            borderRadius: '8px',  // Optional: You can also add other styling properties like border radius, padding, etc.
                            padding: '8px'
                        }
                    },
                    position: { x: 0, y: 0 },
                });
            }

            // Utility function to create edges with labels
            const createEdge = (source, target, label = '') => {
                edges.push({
                    id: `e${source}-${target}`,
                    source: String(source),
                    target: String(target),
                    type: 'custom',
                    data: label ? { label } : { label: '' },  // Ensure 'data' field is set, even if empty
                    animated: true,
                    style: { stroke: '#0029F7', strokeWidth: 2 },
                });
            };

            // Branch 1 logic (true/false/INN/OON condition)
            if (step.Branch1NextStep) {
                const condition = step.Branch1Logic;
                const label = condition === "True" ? "True" : condition === "False" ? "False" : condition || ''; // Handle INN/OON cases
                createEdge(step.StepNumber, step.Branch1NextStep, label);
                traverse(step.Branch1NextStep);
            }

            // Branch 2 logic (true/false/INN/OON condition)
            if (step.Branch2NextStep) {
                const condition = step.Branch2Logic;
                const label = condition === "True" ? "True" : condition === "False" ? "False" : condition || ''; // Handle INN/OON cases
                createEdge(step.StepNumber, step.Branch2NextStep, label);
                traverse(step.Branch2NextStep);
            }

            visited.add(`${stepNumber}`);
        };

        steps.forEach(step => traverse(step.StepNumber));

        console.log('Edges with Labels:', edges);  // Debug log
        return { nodes, edges };
    };



    const flowElements = useMemo(() => {
        if (!claimDetails || !claimDetails.Steps) return { nodes: [], edges: [] };
        const { nodes, edges } = buildGraphData(claimDetails.Steps);
        console.log('Edges with Labels:', edges);  // Check if labels are set here
        return getLayoutedElements(nodes, edges, 'TB');

    }, [claimDetails?.Steps]);


    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
    const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

    const renderExecutionTree = () => {
        if (!flowElements.nodes.length) return null;

        return (
            <div style={{ width: '100%', height: '600px' }}>
                <ReactFlow
                    nodes={flowElements.nodes}
                    edges={flowElements.edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}  // Make sure this is correctly set
                    fitView
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        backgroundColor: '#f4f6fb',
                    }}
                >
                    <MiniMap
                        nodeStrokeColor={(n) => '#0029F7'}
                        nodeColor={(n) => '#c8d3ff'}
                        nodeBorderRadius={6}
                    />
                    <Controls />
                    <Background
                        color="#eee"
                        gap={16}
                        variant="dots"
                    />
                </ReactFlow>

            </div>
        );
    };


    return (
        <div className="claim-details-container">
            <h2
                style={{
                    fontFamily: 'PT Serif',
                    fontWeight: 700,
                    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                    color: '#130976',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                }}
            >
                <span onClick={() => navigate(-1)} style={{ fontSize: '1.5rem' }}>←</span>
                Claim Processing Log
            </h2>

            <div className="claim-header">
                <div><strong>Claim ID:</strong> <br />{claimDetails.ClaimID || 'XXXXXXXXX'}</div>
                <div><strong>Claim Received Date:</strong><br /> {claimDetails.ClaimReceivedDate || 'XXXXXXXXX'}</div>
                <div><strong>Claim Type:</strong><br /> {claimDetails.ClaimType || 'XXXXXXXXX'}</div>
                <div><strong>Skill Level:</strong><br /> {claimDetails.SkillLevel || 'XXXXXXXXX'}</div>
                <div><strong>Fallout Reason:</strong><br /> {claimDetails.FalloutReason || 'XXXXXXXXX'}</div>
                <div> <strong>Status:</strong><br />
                <div className={`status-tag ${claimDetails.ClaimStatus?.toLowerCase() || 'default'}`}>
        {claimDetails.ClaimStatus || 'Status'}
    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tab-header">
                <button
                    className={activeTab === 'log' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('log')}
                >
                    Claim Log
                </button>
                {/* <button
                    className={activeTab === 'execution' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('execution')}
                >
                    Claim Execution Path
                </button> */}
            </div>

            {/* Tab Content */}
            {activeTab === 'log' && (
  <div className="log-steps-table">
    {claimDetails.Steps?.length ? (
      <div className="log-table">
        <div className="log-table-header">
          <div>Time</div>
          <div>Description</div>
          <div>AI Reasoning</div>
        </div>
          {claimDetails.Steps
              .sort((a, b) => {
                  return new Date(padWithDate(a.StepTimestamp)) - new Date(padWithDate(b.StepTimestamp));
              })
              .map((step, index) => (
                  <div key={index} className="log-table-row fade-in">
                      <div className="log-cell time-cell">
                          {step.StepTimestamp ? new Date(padWithDate(step.StepTimestamp)).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                          }) : '--'}
                      </div>
                      <div className="log-cell">{step.StepDescription || 'No description available.'}</div>
                      <div className="log-cell">
                          {step.AIReasoning ? (
                              <span className="ai-reasoning">{step.AIReasoning}</span>
                          ) : (
                              <em>No AI reasoning</em>
                          )}
                      </div>
                  </div>
              ))}
      </div>
    ) : (
      <div>No logs available.</div>
    )}
  </div>
)}



            {activeTab === 'execution' && renderExecutionTree()}

            {/* Modal for Review Claim */}
            <Modal
                visible={isModalVisible}
                onCancel={hideModal}
                footer={null} // No footer with default buttons
                closeIcon={<CloseOutlined />} // Custom close icon
                centered
                width={600} // Modal width
            >
                {/* Title Section */}
                <h2
                    style={{
                        textAlign: 'center',  // Title centered
                        fontSize: '1.5rem',   // Font size for title
                        fontWeight: 'bold',   // Bold title
                        marginTop: '-5px',
                        color: '#130976',
                        fontFamily: 'serif' // Space below the title
                    }}
                >
                    Review Denial Recommendation
                </h2>

                {/* Content Section */}
                <div
                    style={{
                        textAlign: 'center',   // Content centered
                        padding: '20px',
                        paddingTop: '0px'     // Padding around the content
                    }}
                >
                    {/* Content inside the modal */}
                    <div className="claim-info" style={{ marginBottom: '20px' }}>
                        This claim has been flagged due to a match with the Dialysis condition under Step 2.4.1. The system’s confidence score is below the threshold for automatic denial (65.8%).
                    </div>

                    {/* Buttons Container */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            height: '60px',
                            left: 'calc(50% - 304px / 2 - 176px)',
                            top: '596px',

                            borderRadius: '100px',
                        }}
                    >
                        {/* Reject Button */}
                        <Button
                            type="danger"
                            style={{
                                flex: 1,
                                height: '100%',
                                backgroundColor: 'none', // Custom reject color
                                borderRadius: '100px',
                                border: '1px solid #0029F7',
                                color: '#0029F7',
                                fontWeight: 'bold',
                                width: '20%'
                            }}
                            onClick={hideModal}
                        >
                            Reject Denial Recommendation
                        </Button>

                        {/* Approve Button */}
                        <Button
                            type="primary"
                            style={{
                                flex: 1,
                                height: '100%',
                                backgroundColor: '#0029F7', // Custom approve color
                                borderColor: '#1890FF',
                                borderRadius: '100px',
                                border: '1px solid #0029F7',
                                color: 'white',
                                fontWeight: 'bold',
                            }}
                            onClick={hideModal}
                        >
                            Approve Denial Recommendation
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClaimDetails;
