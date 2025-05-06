import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Modal, Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
// import claim from '../data/data.json';
import dagre from 'dagre';
import ReactFlow, { MiniMap, Controls, Background, Handle, Position, BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import 'reactflow/dist/style.css';
import { EyeOutlined } from '@ant-design/icons';
import statusColors from '../utils/statuscolor';
import { ClipLoader } from 'react-spinners'; 
import Lottie from 'lottie-react';
import errorAnimation from '../assets/error.json'; // Place your Lottie file here


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
    const [modalData, setModalData] = useState(null);
const [isModalVisibleone, setIsModalVisibleone] = useState(false);
const [selectedStep, setSelectedStep] = useState(null);
const [isLoadingExecution, setIsLoadingExecution] = useState(false);
const [selectedClaimId, setSelectedClaimId] = useState(null);
const [executionPathData, setExecutionPathData] = useState(null);
const [isDataEmpty, setIsDataEmpty] = useState(false); 
const [apiError, setApiError] = useState(false);


const openModal = (step) => {
  setSelectedStep(step);
  setIsModalVisibleone(true);
};

const handleClose = () => {
  setIsModalVisibleone(false);
  setSelectedStep(null);
};


    const { state } = location;
    const claimDetails = state?.data;
    // setSelectedClaimId(claimDetails.ClaimID);
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
    useEffect(() => {
        if (claimDetails) {
          setSelectedClaimId(claimDetails.ClaimID);
        }
      }, [claimDetails]);

    // Function to show the modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    // Function to hide the modal
    const hideModal = () => {
        setIsModalVisible(false);
    };
    const handleExecutionPathClick = () => {
        setActiveTab('execution');
        setIsLoadingExecution(true);
        setIsDataEmpty(false);
        setApiError(false); // Reset error on each attempt
    
        const claimId = selectedClaimId;
    
        //fetch(`https://xymzogw03g.execute-api.us-east-1.amazonaws.com/dev/graph?ClaimID=${claimId}`)
        fetch(`https://get-claims-data-910002420677.us-central1.run.app/graph?ClaimID=${claimId}`)
            .then(async (response) => {
                if (!response.ok) {
                    // Any status that's not 200-299 is treated as an error
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
    
                if (!data || !data.Steps || data.Steps.length === 0) {
                    setIsDataEmpty(true);
                } else {
                    setExecutionPathData(data);
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error.message);
                setApiError(true); // Triggers the Lottie error animation
            })
            .finally(() => {
                setIsLoadingExecution(false);
            });
    };
    
      
      const renderNoDataMessage = () => {
        return (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.5rem', color: '#555' }}>
            <ClipLoader size={50} color="#0029F7" loading={isLoadingExecution} />
            <div style={{ marginTop: '20px' }}>
              {isDataEmpty ? 'No steps available.' : 'Loading... Please wait.'}
            </div>
          </div>
        );
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
        if (!executionPathData || !executionPathData.Steps) return { nodes: [], edges: [] };
        const { nodes, edges } = buildGraphData(executionPathData.Steps);
        return getLayoutedElements(nodes, edges, 'TB');
    }, [executionPathData]);
    

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
    const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

    const renderExecutionTree = () => {
        if (isLoadingExecution) {
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
              <ClipLoader color="#0029F7" loading={isLoadingExecution} size={50} />
            </div>
          );
        }
      
        if (apiError) {
          return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Lottie animationData={errorAnimation} loop={true} style={{ height: 300 }} />
              <div style={{ fontSize: '1.25rem', color: '#D7263D', marginTop: 20 }}>
              Oops! The execution data missed its cue. Until it's ready, enjoy this version of the tree.
              </div>
            </div>
          );
        }
      
        if (isDataEmpty) {
          return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '1.25rem', color: '#666' }}>No steps available.</div>
            </div>
          );
        }
      
        if (!flowElements.nodes.length) return null;
      
        return (
          <div style={{ width: '100%', height: '600px' }}>
            <ReactFlow
              nodes={flowElements.nodes}
              edges={flowElements.edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                backgroundColor: '#f4f6fb',
              }}
            >
              <MiniMap nodeStrokeColor={() => '#0029F7'} nodeColor={() => '#c8d3ff'} nodeBorderRadius={6} />
              <Controls />
              <Background color="#eee" gap={16} variant="dots" />
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
             
  <div
    style={{
      backgroundColor: statusColors[claimDetails.ClaimStatus]?.background || '#eee',
      color: statusColors[claimDetails.ClaimStatus]?.color || '#333',
      fontWeight: 600,
      padding: '4px 12px',
      borderRadius: '8px',
      display: 'inline-block',
      marginTop: '4px'
    }}
  >
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
                <button
                    className={activeTab === 'execution' ? 'active-tab' : ''}
                    onClick={() => {
                        setActiveTab('execution');
                        handleExecutionPathClick();
                      }}
                      
                >
                    Claim Execution Path
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'log' && (
  <div className="log-steps-table">
    {claimDetails.Steps?.length ? (
      <div className="log-table">
       <div className="log-table-header">
  <div className="log-cell time-cell">Log Time</div>
  <div className="log-cell step-cell">Step #</div>
  <div className="log-cell description-cell">Step Description</div>
  <div className="log-cell description-cell">Agent Name</div>
  <div className="log-cell description-cell">Knowledge Source</div>
  <div className="log-cell reasoning-cell">AI Reasoning</div>
  <div className="log-cell warning-cell">Warning</div>
  
</div>

{claimDetails.Steps
  .sort((a, b) => new Date(a.StepTimestamp) - new Date(b.StepTimestamp))
  .map((step, index) => (
    <div
      key={index}
      className={`log-table-row fade-in ${step.StepWarningFlag === 'Y' ? 'warning-row' : ''}`}
    >
      <div className="log-cell time-cell">
        {step.StepTimestamp
          ? new Date(step.StepTimestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '--'}
      </div>
      <div className="log-cell step-cell">{step.StepId}</div>
      <div className="log-cell description-cell">
        {step.StepDescription || 'No description available.'}
      </div>
      <div className="log-cell description-cell">
        {claimDetails.AgentName || 'No Agent available.'}
      </div>
      <div className="log-cell description-cell">
        {claimDetails.KnowledgeSource || 'No Knowledge Source available.'}
      </div>
      <div className="log-cell reasoning-cell">
        {step.AIReasoning ? (
          <span className="ai-reasoning">{step.AIReasoning}</span>
        ) : (
          <em>No AI reasoning</em>
        )}
      </div>
      <div className="log-cell warning-cell">
  {step.StepWarningFlag === 'Y' ? (
    <span style={{ fontSize: '36px' }}>⚠️</span> // Adjust size here as needed
  ) : ''}
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
            <Modal
  title="Step Details"
  open={isModalVisible}
  onCancel={handleClose}
  footer={null}
>
  {selectedStep && (
    <div>
      <p><strong>Time:</strong> {new Date(selectedStep.StepTimestamp).toLocaleString()}</p>
      <p><strong>Description:</strong> {selectedStep.StepDescription}</p>
      <p><strong>AI Reasoning:</strong></p>
      <p>{selectedStep.AIReasoning}</p>
      {selectedStep.StepWarningFlag === 'Y' && (
        <p style={{ color: 'red' }}><strong>⚠️ Warning Flag is Set</strong></p>
      )}
    </div>
  )}
</Modal>

        </div>
    );
};

export default ClaimDetails;
