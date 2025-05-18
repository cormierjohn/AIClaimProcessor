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
    Input
} from 'antd';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';

import Slider from "react-slick";
import { EditOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';


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
    const [completedClaimsCount, setCompletedClaimsCount] = useState(0);
    const [progressClaimsCount, setProgressClaimsCount] = useState(0);
    const [reviewClaimsCount, setReviewClaimsCount] = useState(0);
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



    const statusColors = {
        "Queued for Ai Agent": { background: '#E6F7FF', color: '#1890FF', dot: '#1890FF' },
        "In Progress": { background: '#FFF7E6', color: '#FA8C16', dot: '#FA8C16' },
        "Denial Attestation Required": { background: '#FFF1F0', color: '#FF4D4F', dot: '#FF4D4F' },
        "Transferred Back": { background: '#FFB74D', color: '#FFFFFF', dot: '#FB8C00' },  //add color which matcheds the transferred back warning kind of alert
        "Approved": { background: '#E6FFFB', color: '#13C2C2', dot: '#13C2C2' },
        "Denial Approved by Adjuster": { background: '#FFF1F0', color: '#FF4D4F', dot: '#FF4D4F' },
        "Denial Overturned by Adjuster": { background: '#FFF1F0', color: '#FF4D4F', dot: '#FF4D4F' },
        "Denial Transferred by Adjuster": { background: '#FFF1F0', color: '#FF4D4F', dot: '#FF4D4F' },
      
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
            dataIndex: 'dueDate',  // <- Corrected this line
            key: 'dueDate',
        },
        {
            title: 'Claim Type',
            dataIndex: 'claimType',
            key: 'claimType',
        },
        {
            title: 'Skill Level',
            dataIndex: 'skill',
            key: 'skill',
        },
        {
            title: 'Fallout Reason',
            dataIndex: 'fallouttype',
            key: 'fallouttype',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                // Log the status and record to verify data
                console.log("Rendering status:", status, "for record:", record);

                // Define the status colors
                const currentStatus = statusColors[status] || { background: '#f0f0f0', color: '#000', dot: '#000' };

                // Adjust the condition to check for more statuses
                const showEdit = ['denial recommended', 'denial attestation required', 'denial approved', 'denial overturned'].includes(status?.toLowerCase());
                const isDenial = status?.toLowerCase() === 'denial attestation required';

                // Log if showEdit and isDenial are being set properly
                console.log("showEdit:", showEdit, "isDenial:", isDenial);

                const content = (
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            backgroundColor: currentStatus.background,
                            color: currentStatus.color,
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontWeight: 500,
                            fontSize: '14px',
                            position: 'relative',
                            gap: '6px',
                        }}
                    >
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
                        {/* Log when the Edit button is rendered */}
                        {!record.hasAttestation && showEdit && (
                            <EditOutlined
                                style={{
                                    color: '#0029F7',
                                    fontSize: '14px',
                                    marginLeft: '6px',
                                    cursor: 'pointer',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Edit button clicked for record:", record);  // Log the record clicked
                                    setModalRecord(record); // Store the record for modal
                                    setSummary(record.summary || ''); // Set summary for the modal
                                    setManualDetermination(record.status || 'Default Option'); // Set manual determination value
                                    setNotes(''); // Clear any existing notes
                                    setIsModalOpen(true); // Open the modal
                                }}
                            />
                        )}
                    </div>
                );

                // Log if Tooltip is applied for denial status
                console.log("isDenial Tooltip:", isDenial);

                return isDenial ? (
                    <Tooltip title={record.summary || 'Summary not available'} placement="left">
                        {content}
                    </Tooltip>
                ) : (
                    content
                );
            },
            sorter: (a, b) => a.status.localeCompare(b.status),
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
                console.log(result.length); // Log the number of records

                setApiLength(result.length);

                // Function to count claims by status
                const countClaimsByStatus = (status) => result.filter((item) => item.ClaimStatus === status).length;

                const processedClaimsCount = countClaimsByStatus("Approved");
                const completedClaimsCount = countClaimsByStatus("Completed");
                const inProgressClaimsCount = countClaimsByStatus("In Progress");
                const inReviewClaimsCount = countClaimsByStatus("Denial Attestation Required");

                // Set counts to state
                setProcessedClaimsCount(processedClaimsCount);
                setCompletedClaimsCount(completedClaimsCount);
                setProgressClaimsCount(inProgressClaimsCount);
                setReviewClaimsCount(inReviewClaimsCount);

                // Transform the data
                const transformedData = result.map((item) => ({
                    claimId: item.ClaimID,
                    dueDate: item.ClaimReceivedDate,
                    claimType: item.ClaimType || 'N/A',
                    skill: item.SkillLevel || 'N/A',
                    fallouttype: item.FalloutReason || 'N/A',
                    status: item.ClaimStatus,
                    summary: item.Steps?.map(step => step.AIReasoning).join('\n\n') || 'No summary available',
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
            label: 'Total Claims in Inventory',
            value: progressClaimsCount + apilength - reviewClaimsCount + processedClaimsCount + reviewClaimsCount
        },
        {
            icon: '/logo10.svg',
            label: 'In Progress Claims​',
            value: progressClaimsCount
        },
        {
            icon: '/logo8.svg',
            label: 'Processed Claims​',
            value: apilength - reviewClaimsCount
        },
        {
            icon: '/logo11.svg',
            label: 'Approved Claims​',
            value: processedClaimsCount
        },
        {
            icon: '/logo12.svg',
            label: 'Claims Recommended for Denial Attestation​',
            value: reviewClaimsCount
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

    // const applyFilters = () => {
    //     console.log("Selected Filters:", selectedClaimType, selectedStatus, selectedSkill, selectedFalloutReason);

    //     const filtered = data.filter(item => {
    //         console.log("Checking item:", {
    //             claimType: item.ClaimType,
    //             status: item.ClaimStatus,
    //             skill: item.SkillLevel,
    //             falloutReason: item.FalloutReason,
    //         });

    //         // Match the ClaimType, ClaimStatus, and SkillLevel based on selected filters
    //         const matchClaimType = selectedClaimType ? item.ClaimType === selectedClaimType : true;
    //         const matchStatus = selectedStatus ? item.ClaimStatus === selectedStatus : true;
    //         const matchSkill = selectedSkill ? item.SkillLevel === selectedSkill : true;

    //         // Handle FalloutReason filtering with case-insensitive partial matching (if applicable)
    //         const matchFallout = selectedFalloutReason 
    //             ? item.FalloutReason && item.FalloutReason.toLowerCase().includes(selectedFalloutReason.toLowerCase())
    //             : true;

    //         return matchClaimType && matchStatus && matchSkill && matchFallout;
    //     });

    //     console.log("Filtered Data:", filtered);
    //     setFilteredData(filtered);
    // };

    const resetFilters = () => {
        setSelectedClaimType(null);
        setSelectedStatus(null);
        setSelectedSkill(null);
        setSelectedFalloutReason(null);
        setClaimList(initialClaimList); // Reset the filtered data to the original data
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

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
                        <Col xs={24} xl={20} xxl={19.5}> {/* Slightly less than 20 to account for gutter */}
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
                                    pageSize: 4,
                                    showSizeChanger: false,
                                    showQuickJumper: false,
                                    position: ['bottomRight'],
                                    simple: true,
                                }}
                            />



                        </Col>

                        {/* Sidebar Column - 20% width */}
                        <Col
                            xs={24}
                            xl={4}
                            xxl={4.5}
                            style={{
                                padding: 0,            // Remove horizontal padding
                                margin: 0              // Remove any default margin from the grid
                            }}
                        >
                            <Card
                                title={
                                    <span
                                        style={{
                                            fontFamily: 'Inter',
                                            fontWeight: 700,
                                            fontSize: 25,
                                            lineHeight: '100%',
                                            color: '#130976'
                                        }}
                                    >
                                        Filters
                                    </span>
                                }
                                headStyle={{
                                    borderBottom: 'none',
                                    padding: 0,
                                    paddingBottom: 0, // Optional: some spacing under the header
                                }}
                                style={{
                                    marginTop: 55,        // Remove top spacing
                                    width: '100%',
                                    maxWidth: '100%',    // Make it fluid inside the Col
                                    marginLeft: 0,       // Avoid auto alignment
                                    padding: 16          // Optional: internal padding inside the card
                                }}
                                bodyStyle={{
                                    padding: 0,          // Optional: adjust to your spacing needs
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* <Row>
                                        <Col span={24}>
                                            <div style={{ fontWeight: 600, color: '#130976', marginBottom: 0 }}>
                                                Time range (hours)
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <AntSlider
                                                    min={1}
                                                    max={168}
                                                    onChange={value => setHours(value)}
                                                    value={typeof hours === 'number' ? hours : 0}
                                                    style={{ flex: 1 }}
                                                    className="custom-slider"
                                                />
                                                <InputNumber
                                                    min={1}
                                                    max={168}
                                                    value={hours}
                                                    onChange={value => setHours(value)}
                                                    style={{
                                                        width: 64,
                                                        height: 64,
                                                        lineHeight: '64px',
                                                        textAlign: 'center',
                                                        fontSize: 18,
                                                        fontWeight: 500,
                                                        borderRadius: 8
                                                    }}
                                                />
                                            </div>
                                        </Col>
                                    </Row> */}

                                    <Select
                                        placeholder="Claim Type"
                                        style={{ height: 64 }}
                                        dropdownStyle={{ minWidth: 200 }}
                                        value={selectedClaimType}
                                        onChange={value => setSelectedClaimType(value)}
                                    >
                                        {predefinedClaimTypes.map((type, index) => (
                                            <Option key={index} value={type}>{type}</Option>
                                        ))}
                                    </Select>

                                    <Select
                                        placeholder="Status"
                                        style={{ height: 64 }}
                                        dropdownStyle={{ minWidth: 200 }}
                                        onChange={value => setSelectedStatus(value)} // Store selected Status
                                    >
                                        {statuses.map((status, index) => (
                                            <Option key={index} value={status}>{status}</Option>
                                        ))}
                                    </Select>
                                    <Select
                                        placeholder="Skill"
                                        style={{ height: 64 }}
                                        dropdownStyle={{ minWidth: 200 }}
                                        value={selectedSkill}
                                        onChange={value => setSelectedSkill(value)}
                                    >
                                        {skilllevel.map((status, index) => (
                                            <Option key={index} value={status}>{status}</Option>
                                        ))}
                                    </Select>

                                    <Select
                                        placeholder="Fallout Reason"
                                        style={{ height: 64 }}
                                        dropdownStyle={{ minWidth: 200 }}
                                        value={selectedFalloutReason}
                                        onChange={value => setSelectedFalloutReason(value)}
                                    >
                                        {falloutreasons.map((status, index) => (
                                            <Option key={index} value={status}>{status}</Option>
                                        ))}
                                    </Select>

                                    <Button
                                        type="primary"
                                        block
                                        style={{
                                            height: 60,
                                            borderRadius: 100,
                                            backgroundColor: '#0029F7',
                                            color: '#fff',
                                            fontWeight: 500,
                                            fontSize: 16
                                        }}
                                        onClick={applyFilters} >
                                        Apply
                                    </Button>
                                    <Button
                                        type="default"
                                        block
                                        style={{
                                            height: 60,
                                            borderRadius: 100,
                                            backgroundColor: '#E0E0E0',
                                            color: '#000',
                                            fontWeight: 500,
                                            fontSize: 16,
                                        }}
                                        onClick={resetFilters}  // Call the resetFilters function when clicked
                                    >
                                        Reset Filters
                                    </Button>
                                </div>
                            </Card>
                        </Col>

                    </Row>
                </Content>
                <Modal
                    title="Denial Attestation Required"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>,
                    <Button
                    key="submit"
                    type="primary"
                    onClick={async () => {
                      const payload = {
                        ClaimID: modalRecord?.claimId,
                        Summary: summary,
                        Determination: manualDetermination,
                        ClaimStatus: manualDetermination,
                        Notes: notes,
                        lastupdated: new Date().toLocaleDateString()
                      };
                  
                      console.log("Submitting with payload:", payload);  // Log the payload being sent
                  
                      try {
                        // API call to update claim status
                        const response = await fetch('https://xymzogw03g.execute-api.us-east-1.amazonaws.com/dev/claimupdate', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });
                  
                        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
                  
                        const result = await response.json();
                        console.log('API Response:', result);
                  
                        console.log("Before update:", claimList);
                        setClaimList((prevClaims) =>
                          prevClaims.map((claim) =>
                            claim.claimId === modalRecord.claimId
                              ? {
                                  ...claim,
                                  status: manualDetermination, // Update the status
                                  summary,
                                  hasAttestation: true,  // Mark as attested
                                  attestationComment: `Completed on ${new Date().toLocaleString()}`, // Add comment with timestamp
                                  attestationDate: new Date().toLocaleDateString(), // Store date
                                }
                              : claim
                          )
                        );
                        console.log("After update:", claimList);
                        
                  
                        console.log("Claim list updated successfully");
                        setIsModalOpen(false); // Close the modal
                      } catch (error) {
                        console.error('Submission error:', error);
                      }
                    }}
                  >
                    Submit
                  </Button>
                  
                    ]}
                >
                    <div style={{ marginBottom: 16 }}>
                        <label><strong>Summary</strong></label>
                        <TextArea
                            rows={3}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label><strong>Manual Determination</strong></label>
                        <Select
                            style={{ width: '100%' }}
                            value={manualDetermination}
                            onChange={(value) => setManualDetermination(value)}
                        >

                            <Option value="Denial Approved by Adjuster">Denial Approved by Adjuster</Option>
                            <Option value="Denial Overturned by Adjuster">Denial Overturned by Adjuster</Option>
                            <Option value="Denial Transferred by Adjuster">Denial Transferred by Adjuster</Option>


                        </Select>
                    </div>

                    <div>
                        <label><strong>Notes</strong></label>
                        <TextArea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </Modal>

            </Layout>
        </Spin>
    );
}

export default Claims;
