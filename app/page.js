"use client";
import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, List } from 'antd';
import Name from "./components/name";

const initialHierarchyData = {
    title: 'CEO',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+123456789',
    children: [
        {
            title: 'Head of staff/HR',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+987654321',
            children: [
                {
                    title: 'Team 1',
                    teamName: 'Team 1',
                    children: [
                        {
                            title: 'Team leader',
                            name: 'Alice Johnson',
                            email: 'alice.johnson@example.com',
                            phone: '+111111111'
                        },
                        {
                            title: 'Team member',
                            name: 'Bob Williams',
                            email: 'bob.williams@example.com',
                            phone: '+222222222'
                        }
                    ]
                },
                {
                    title: 'Team 2',
                    teamName: 'Team 2',
                    children: [
                        {
                            title: 'Team leader',
                            name: 'Eve Brown',
                            email: 'eve.brown@example.com',
                            phone: '+333333333'
                        },
                        {
                            title: 'Team member',
                            name: 'Charlie Davis',
                            email: 'charlie.davis@example.com',
                            phone: '+444444444'
                        }
                    ]
                }
            ]
        },
        {
            title: 'Head of engineering',
            name: 'Michael Wilson',
            email: 'michael.wilson@example.com',
            phone: '+555555555',
            children: [
                {
                    title: 'Team 2',
                    teamName: 'Engineering Team',
                    children: [
                        {
                            title: 'Team leader',
                            name: 'Grace Lee',
                            email: 'grace.lee@example.com',
                            phone: '+666666666'
                        },
                        {
                            title: 'Team member',
                            name: 'David Clark',
                            email: 'david.clark@example.com',
                            phone: '+777777777'
                        }
                    ]
                }
            ]
        },
        {
            title: 'Head of design',
            name: 'Olivia Garcia',
            email: 'olivia.garcia@example.com',
            phone: '+888888888',
            children: [
                {
                    title: 'Team 1',
                    teamName: 'Design Team',
                    children: [
                        {
                            title: 'Team leader',
                            name: 'Sophia Martinez',
                            email: 'sophia.martinez@example.com',
                            phone: '+999999999'
                        },
                        {
                            title: 'Team member',
                            name: 'Lucas Rodriguez',
                            email: 'lucas.rodriguez@example.com',
                            phone: '+1010101010'
                        }
                    ]
                }
            ]
        }
    ]
};
const MyHierarchyComponent = () => {
    const [hierarchyData, setHierarchyData] = useState(initialHierarchyData);
    const [isClient, setIsClient] = useState(false);

    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            const savedData = localStorage.getItem('hierarchyData');
            if (savedData) {
                setHierarchyData(JSON.parse(savedData));
            }
        }
    }, [isClient]);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('hierarchyData', JSON.stringify(hierarchyData));
        }
    }, [hierarchyData, isClient]);

    const handleDetailsUpdate = (updatedDetails) => {
        const updatedHierarchyData = updateDetailsInHierarchy(hierarchyData, updatedDetails);
        setHierarchyData(updatedHierarchyData);
    };

    const updateDetailsInHierarchy = (node, updatedDetails) => {
        if (node.title === updatedDetails.title && (node.name === updatedDetails.name || node.teamName === updatedDetails.teamName)) {
            return { ...node, ...updatedDetails };
        }
        if (node.children) {
            return {
                ...node,
                children: node.children.map(child => updateDetailsInHierarchy(child, updatedDetails))
            };
        }
        return node;
    };

    const renderHierarchy = (node) => {
        return (
            <li key={node.title + (node.name || node.teamName)}>
                <Name
                    text={node.title.includes("Team") ? node.teamName || node.title : node.title}
                    details={node}
                    onDetailsUpdate={handleDetailsUpdate}
                />
                {node.children && (
                    <ul>
                        {node.children.map(child => renderHierarchy(child))}
                    </ul>
                )}
            </li>
        );
    };

    const handleSearch = () => {
        const results = searchEmployees(hierarchyData, searchQuery);
        setSearchResults(results);
        setSearchModalVisible(true);
    };

    const searchEmployees = (node, query) => {
        let results = [];
        if (node.name && node.name.toLowerCase().includes(query.toLowerCase())) {
            results.push(node);
        }
        if (node.email && node.email.toLowerCase().includes(query.toLowerCase())) {
            results.push(node);
        }
        if (node.phone && node.phone.toLowerCase().includes(query.toLowerCase())) {
            results.push(node);
        }
        if (node.children) {
            node.children.forEach(child => {
                results = results.concat(searchEmployees(child, query));
            });
        }
        return results;
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchModalCancel = () => {
        setSearchModalVisible(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div>
            <h1>Company Hierarchy</h1>
            <div style={{ marginBottom: 20 }}>
                <Input placeholder="Search by name, phone, or email" value={searchQuery} onChange={handleSearchInputChange} />
                <Button type="primary" style={{ marginLeft: 10 }} onClick={handleSearch}>Search</Button>
            </div>
            <ul>
                {renderHierarchy(hierarchyData)}
            </ul>
            <Modal
                title="Search Results"
                visible={searchModalVisible}
                onCancel={handleSearchModalCancel}
                footer={[
                    <Button key="back" onClick={handleSearchModalCancel}>
                        Close
                    </Button>
                ]}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={searchResults}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.name || item.teamName}
                                description={item.email ? `Email: ${item.email}` : `Phone: ${item.phone}`}
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default MyHierarchyComponent;
