import React, { useState, useEffect } from 'react';
import {
    Layout,
    Card,
    Row,
    Col,
    Table,
    Tag,
    Select,
    Button,
    Slider as AntSlider,
    InputNumber,
    Spin,
    Modal,
    Input,
    Checkbox
} from 'antd';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';

import Slider from "react-slick";
import { EyeOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { statusColors } from '../utils/statuscolor.js';


const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const API_URL = 'https://get-claims-data-910002420677.us-central1.run.app/getClaimGraph';

// Summary card data


const NextArrow = ({ onClick }) => (
    <div
        style={{
            position: 'absolute',
            right: '-40px',  // Increased distance from carousel
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            zIndex: 10,      // Higher z-index to ensure visibility
            background: '#0029F7',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
        }}
        onClick={onClick}
    >
        <RightOutlined />
    </div>
);

const PrevArrow = ({ onClick }) => (
    <div
        style={{
            position: 'absolute',
            left: '-40px',   // Increased distance from carousel
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            zIndex: 10,      // Higher z-index to ensure visibility
            background: '#0029F7',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
        }}
        onClick={onClick}
    >
        <LeftOutlined />
    </div>
);



function Claims() {

    const [hours, setHours] = useState(34);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [claimDetails, setClaimDetails] = useState(null);
    const [apilength, setApiLength] = useState(0);
    const [processedClaimsCount, setProcessedClaimsCount] = useState(0);
    const [queuedClaimsCount, setQueuedClaimsCount] = useState(0);
    const [completedClaimsCount, setCompletedClaimsCount] = useState(0);
    const [progressClaimsCount, setProgressClaimsCount] = useState(0);
    const [reviewClaimsCount, setReviewClaimsCount] = useState(0);
    const [reviewOverturnedClaimsCount, setReviewOverturnedClaimsCount] = useState(0);
    const [reviewUpheldClaimsCount, setReviewUpheldClaimsCount] = useState(0);
    const [denialRecomendationsCount, setDenialRecommendationsCount] = useState(0);
    const [transferredBackCount, setTransferredBackCount] = useState(0);
    const [filteredData, setFilteredData] = useState([]);  // Filtered data after applying filters
    const [claimTypes, setClaimTypes] = useState([]);  // Claim Types for dropdown
    const [selectedClaimType, setSelectedClaimType] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalRecord, setModalRecord] = useState(null); // Stores clicked record
    const [manualDetermination, setManualDetermination] = useState('Default Option');
    const [notes, setNotes] = useState('');
    const [summary, setSummary] = useState('');
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [selectedFalloutReason, setSelectedFalloutReason] = useState(null);
    const [claimList, setClaimList] = useState([]);
    const [initialClaimList, setInitialClaimList] = useState([]);
    const [transferClaimList, settransferClaimList] = useState([]);
    const [showTransferredStatus, setShowTransferredStatus] = useState(false);




    const statusColors = {
        "Queued for Ai Agent": { background: '#E6F7FF', color: '#1890FF', dot: '#1890FF' },
        "In Progress": { background: '#FFF7E6', color: '#FA8C16', dot: '#FA8C16' },
        "Denial Attestation Required": { background: '#FFF1F0', color: '#FF4D4F', dot: '#FF4D4F' },
        "Transferred Back": { background: '#FFB74D', color: '#FFFFFF', dot: '#FB8C00' },  //add color which matcheds the transferred back warning kind of alert
        "Approved": { background: '#E6FFFB', color: '#13C2C2', dot: '#13C2C2' },
        "Denial Recommendation Overturned": { background: '#fff633', color: '#FF4D4F', dot: '#FF4D4F' },

    };

    const predefinedClaimTypes = ['Proclaim Skill 1',
        'Proclaim CBH S1',
        'Proclaim Lifesource',
        'Proclaim Skill 2',
        'Proclaim CBH S2',
        'Proclaim Autism',
        'Proclaim Alliance',
        'High Dollar S1',
        'Proclaim Dialysis',
        'Proclaim ECP',
        'High Dollar S2',
        'Proclaim Adjustment'
    ];

    const falloutreasons = ['Duplicate Claim', 'Assignment of Benefits to Network Provider', 'DME Rental to Purchase', 'Possible Infertility', 'Possible Duplicate Claims', 'Void, Replacement, or Corrected Claims', 'Authorization Matching', 'Autism (ABA) Therapy Bypass', 'UM Notes Exist WMWM 0040', 'UM Excess Units WMWM 0055', 'Unlisted Procedure Review', 'COB Examiner Error', 'COB Medicare Investigation Needed', 'Medicare Primary Coordination', 'CXT History Edit Bypass', 'Claims Examiner Error', 'Errors Manual Price', 'Multiple Vision Exam Services', 'Large Dollar Claims', 'IFP OON Provider Review Bypass'];
    const skilllevel = ['Skill 1', 'Skill 1+2+3', 'Skill 2', 'Skill 3', 'Skill 2+3']



    const statuses = Object.keys(statusColors);
    const hasAnyAttestation = claimList.some(claim => claim.hasAttestation);
    const columns = [
        {
            title: 'Claim ID',
            dataIndex: 'claimId',
            key: 'claimId',
            render: (text, record) => (
                <span
                    style={{
                        color: '#0029F7',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                    }}
                    onClick={() => handleRowClick(record)}
                >
                    {text}
                </span>
            ),
            sorter: (a, b) => a.claimId.localeCompare(b.claimId),
        },
        {
            title: 'Claim Received Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (text) => <span>{new Date(text).toLocaleDateString()}</span>,
            sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
        },
        {
            title: 'Claim Processed Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (text) => <span>{new Date(text).toLocaleDateString()}</span>,
            sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
        },
        {
            title: 'Claim Type',
            dataIndex: 'claimType',
            key: 'claimType',
            sorter: (a, b) => a.claimType.localeCompare(b.claimType),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search Claim Type"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Button onClick={() => confirm()} type="primary" size="small" style={{ width: 90, marginRight: 8 }}>
                        Search
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </div>
            ),
            onFilter: (value, record) => record.claimType.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Skill',
            dataIndex: 'skill',
            key: 'skill',
            sorter: (a, b) => a.skill.localeCompare(b.skill),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search Skill"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={confirm}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Button onClick={confirm} type="primary" size="small" style={{ width: 90, marginRight: 8 }}>
                        Search
                    </Button>
                    <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </div>
            ),
            onFilter: (value, record) => record.skill?.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Fallout Reason',
            dataIndex: 'fallouttype',
            key: 'fallouttype',
            sorter: (a, b) => a.fallouttype.localeCompare(b.fallouttype),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search Fallout Reason"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={confirm}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Button onClick={confirm} type="primary" size="small" style={{ width: 90, marginRight: 8 }}>
                        Search
                    </Button>
                    <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </div>
            ),
            onFilter: (value, record) => record.fallouttype?.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
              const currentStatus = statusColors[status] || { background: '#f0f0f0', color: '#000', dot: '#000' };
              const showEdit = ['denial recommended', 'denial attestation required', 'denial approved', 'denial overturned'].includes(status?.toLowerCase());
              const isTransferredClaimCompanion = record.transferclaim?.toUpperCase() === 'Y';
          
              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    backgroundColor: currentStatus.background,
                    color: currentStatus.color,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 500,
                    fontSize: '14px',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: currentStatus.dot,
                        borderRadius: '50%',
                        marginRight: '8px',
                      }}
                    />
                    {status}
          
                    {!record.hasAttestation && showEdit && (
                      <EyeOutlined
                        style={{
                          color: '#0029F7',
                          fontSize: '14px',
                          marginLeft: '6px',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalRecord(record);
                          setSummary(record.summary || '');
                          setManualDetermination(record.status || 'Default Option');
                          setNotes('');
                          setIsModalOpen(true);
                          setShowTransferredStatus(record.transferclaim);
                        }}
                      />
                    )}
                  </div>
          
                  {!record.hasAttestation && showEdit && (
                    <span
                      style={{
                        marginLeft: 16,
                        color: '#000',
                        fontStyle: 'italic',
                      }}
                    >
                      {isTransferredClaimCompanion
                        ? 'Transferred to Claim Companion'
                        : 'Awaiting Transfer to Claims Companion'}
                    </span>
                  )}
                </div>
              );
            },
          
            sorter: (a, b) => a.status.localeCompare(b.status),
          
            // 🔍 Added filter
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
              <div style={{ padding: 8 }}>
                <Input
                  placeholder="Search Status"
                  value={selectedKeys[0]}
                  onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                  onPressEnter={confirm}
                  style={{ marginBottom: 8, display: 'block' }}
                />
                <Button onClick={confirm} type="primary" size="small" style={{ width: 90, marginRight: 8 }}>
                  Search
                </Button>
                <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                  Reset
                </Button>
              </div>
            ),
            onFilter: (value, record) => record.status?.toLowerCase().includes(value.toLowerCase()),
          }
          

    ];

    const columns1 = hasAnyAttestation
        ? [
            ...columns,
            {
                title: 'Attestation Date',
                dataIndex: 'attestationDate',
                key: 'attestationDate',
                render: (date) => <span>{date}</span>,
                sorter: (a, b) => new Date(a.attestationDate) - new Date(b.attestationDate),
            },
        ]
        : columns;

    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(API_URL);
                const result = await response.json();
                console.log(result); // Log the number of records

                setApiLength(result.length);

                // Function to count claims by status
                const countClaimsByStatus = (status) => result.filter((item) => item.ClaimStatus === status).length;

                const processedClaimsCount = countClaimsByStatus("Approved");
                const completedClaimsCount = countClaimsByStatus("Completed");
                const inProgressClaimsCount = countClaimsByStatus("In Progress");
                const queuedClaimsCount = countClaimsByStatus("Queued for AI Agent"); //Queued Claims
                const inReviewClaimsCount = countClaimsByStatus("Denial Attestation Required");
                const inReviewOverturnedClaimsCount = countClaimsByStatus("Denial Recommendation Overturned");
                const inReviewUpheldClaimsCount = countClaimsByStatus("Denial Recommendation Approved");
                const denialRecommendationsCount = countClaimsByStatus("Denial Recommendation Overturned");
                const transferredBackCount = countClaimsByStatus("Transferred Back");

                // Set counts to state
                setProcessedClaimsCount(processedClaimsCount);
                setCompletedClaimsCount(completedClaimsCount);
                setProgressClaimsCount(inProgressClaimsCount);
                setReviewClaimsCount(inReviewClaimsCount);
                setReviewOverturnedClaimsCount(inReviewOverturnedClaimsCount)
                setReviewUpheldClaimsCount(inReviewUpheldClaimsCount)
                setTransferredBackCount(transferredBackCount);
                setDenialRecommendationsCount(denialRecommendationsCount)

                // Transform the data
                const transformedData = result.map((item) => ({
                    claimId: item.ClaimID,
                    dueDate: item.ClaimReceivedDate,
                    claimType: item.ClaimType || 'N/A',
                    skill: item.SkillLevel || 'N/A',
                    fallouttype: item.FalloutReason || 'N/A',
                    transferclaim: item.TransferredClaimCompanionStatus || 'N/A',
                    status: item.ClaimStatus,
                    agentName: item.AgentName || 'N/A',
                    knowledgesource: item.KnowledgeSource || 'N/A',
                    summary: item.Summary || 'N/A',
                    steps: item.Steps || [],
                }));

                // Log transformed data to ensure it's correct
                console.log(transformedData);

                setData(transformedData);
                setFilteredData(transformedData);
                setClaimList(transformedData);
                setInitialClaimList(transformedData);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const applyFilters = () => {
        console.log("Applying Filters:", selectedClaimType, selectedStatus, selectedSkill, selectedFalloutReason);

        const filteredClaims = claimList.filter(item => {
            return (
                (selectedClaimType ? item.claimType === selectedClaimType : true) &&
                (selectedStatus ? item.status === selectedStatus : true) &&
                (selectedSkill ? item.skill === selectedSkill : true) &&
                (selectedFalloutReason ? item.fallouttype === selectedFalloutReason : true)
            );
        });

        // Directly update claimList with filtered data
        setClaimList(filteredClaims);
    };

    // useEffect(() => {
    //     applyFilters();
    // }, [selectedClaimType, selectedStatus, selectedSkill, selectedFalloutReason]);


    const summaryData = [
        {
            icon: '/logo7.svg',
            label: 'Claims in Queue',
            value: processedClaimsCount
        },
        {
            icon: '/logo8.svg',
            label: 'Total Claims Processed',
            value: 5
        },
        {
            icon: '/logo11.svg',
            label: 'Approved Claims',
            value: processedClaimsCount
        },
        {
            icon: '/logo10.svg',
            label: 'Attestation Complete',
            value: reviewOverturnedClaimsCount + reviewUpheldClaimsCount
        },
        {
            icon: '/logo10.svg',
            label: 'Claims Requiring Attestation',
            value: reviewClaimsCount
        },
        {
            icon: '/logo12.svg',
            label: 'Claims Transferred Back',
            value: transferredBackCount
        },
    ];
    const sliderSettings = {
        dots: false,
        infinite: summaryData.length > 6,
        speed: 500,
        slidesToShow: 6,  // Number of slides to show at once
        slidesToScroll: 1,  // Number of slides to scroll at a time
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1400,
                settings: { slidesToShow: 4 }  // Show 4 slides on medium screens
            },
            {
                breakpoint: 1024,
                settings: { slidesToShow: 3 }  // Show 3 slides on smaller screens
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 2 }  // Show 2 slides on even smaller screens
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 1 }  // Show 1 slide on mobile devices
            }
        ]
    };

    const handleRowClick = async (record) => {

        setLoading(true);  // Set loading to true while fetching the details
        try {
            // Construct the URL dynamically using the claimId from the clicked record
            const response = await fetch(`https://get-claims-data-910002420677.us-central1.run.app/getClaimGraph?ClaimID=${record.claimId}`);

            const data = await response.json();  // Parse the response to JSON


            // Store the detailed claim data in state
            setClaimDetails(data);

            // Navigate to the detailed claim page, passing the data in the state
            navigate(`/claim/${record.claimId}`, { state: { data } });
        } catch (error) {
            console.error('Error fetching claim details:', error);
        } finally {
            setLoading(false);  // Set loading to false once the data is fetched
        }
    };


    const resetFilters = () => {
        setSelectedClaimType(null);
        setSelectedStatus(null);
        setSelectedSkill(null);
        setSelectedFalloutReason(null);
        setClaimList(initialClaimList); // Reset the filtered data to the original data
    };



    return (
        <Spin spinning={loading} tip="Loading..." size="large">
            <Layout style={{ minHeight: '100vh' }}>
                <Content style={{ padding: '24px' }}>
                    <h2
                        style={{
                            fontFamily: 'PT Serif',
                            fontWeight: 700,
                            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                            color: '#130976',
                            marginBottom: 24,
                            display: 'flex'
                        }}
                    >
                        Overall Summary
                    </h2>

                    {/* Carousel for Summary Cards */}
                    <div style={{
                        marginBottom: 40,
                        position: 'relative',
                        padding: '0 40px',  // Add padding to prevent arrow clipping
                        maxWidth: "98%",
                        margin: "0 auto"
                    }}>
                        <Slider {...sliderSettings}>
                            {summaryData.map((item, index) => (
                                <div key={item.ClaimID} style={{ padding: '0 8px' }}>
                                    <div
                                        style={{
                                            width: '280px',
                                            height: '192px',
                                            border: '2px solid #F3F5FF',
                                            borderRadius: '12px',
                                            background: '#fff',
                                            padding: '24px',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            margin: 'auto'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <div style={{
                                                fontSize: '20px',
                                                color: '#0029F7'
                                            }}>
                                                <img src={item.icon} alt={item.label} style={{
                                                    width: '40px',    // Set a fixed width
                                                    height: '40px',   // Set a fixed height
                                                    objectFit: 'contain', // Maintain aspect ratio while filling the box
                                                }} />
                                            </div>
                                            <div style={{
                                                fontSize: '20px',
                                                color: '#333',
                                                fontWeight: 500,
                                                display: 'flex',
                                                textAlign: 'left'

                                            }}>
                                                {item.label}
                                            </div>
                                        </div>

                                        <div style={{
                                            fontFamily: 'sans-serif',
                                            fontWeight: 600,
                                            fontSize: '40px',
                                            lineHeight: '100%',
                                            letterSpacing: '0%',
                                            color: '#130976',
                                            display: 'flex' // Align with icon
                                        }}>
                                            {item.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>


                    {/* ... (keep your existing carousel code) ... */}

                    {/* Claim Inventory Section - Now properly aligned with table */}
                    <Row gutter={16}>
                        {/* Main Content Column - 80% width */}
                        <Col span={24}> {/* Slightly less than 20 to account for gutter */}
                            {/* Header Row */}
                            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                                <Col>
                                    <h2 style={{
                                        fontFamily: 'PT Serif',
                                        fontWeight: 700,
                                        fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                                        color: '#130976',
                                        margin: 0
                                    }}>
                                        Claim Inventory
                                    </h2>
                                </Col>
                            </Row>
                            <style>
                                {`
                                .custom-row-height {
                                    height: 75px !important;
                                }
                                    .custom-row-height:hover {
                  background-color: #E9EDFE !important;
                  cursor: pointer;
                }
                            `}
                            </style>
                            {/* Table with pagination */}
                            <Table
                                columns={columns1}
                                dataSource={claimList}   // Ensure this is the updated state
                                rowKey="claimId"  // Ensure this is a unique key for each row
                                rowClassName={() => 'custom-row-height'}
                                onRow={(record) => ({
                                    onClick: (event) => {
                                        if (event.target.tagName.toLowerCase() === 'a') return;
                                        handleRowClick(record);
                                    },
                                })}
                                pagination={{
                                    pageSize: 8,
                                    showSizeChanger: false,
                                    showQuickJumper: false,
                                    position: ['bottomRight'],
                                    simple: true,
                                }}
                            />



                        </Col>

                      
                    </Row>
                </Content>
                <Modal
                    title="Denial Attestation Required"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                >
                    <div style={{ marginBottom: 16 }}>
                        <label><strong>Summary</strong></label>
                        <TextArea
                            rows={3}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                        <label><strong>Action Taken</strong> : {showTransferredStatus === 'N' ? 'Transferred to Claim Companion' : 'Transferred to Claims Companion'}</label>
                    </div>


                </Modal>
            </Layout>
        </Spin>
    );
}

export default Claims;
