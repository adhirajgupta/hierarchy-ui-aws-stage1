import React, { useState } from 'react';
import { Button, Divider, Popover, Modal, Form, Input, Select } from 'antd';

const { Option } = Select;


const Name = ({ text, details, onDetailsUpdate }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formData, setFormData] = useState(details);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMemberIndex, setNewMemberIndex] = useState(null);
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [newTeam, setNewTeam] = useState({});
    const [selectedOption, setSelectedOption] = useState('');
    const [isEditingTeamMember, setIsEditingTeamMember] = useState(false);
    const [isShiftingTeam, setIsShiftingTeam] = useState(false);
    const [option, setOption] = useState([])

    const onChange = (value) => {
        setSelectedOption(value);
    };

    const handleShiftTeam = () => {
        setOption(getAllTeamNames(details))
        setIsModalVisible(true)
        setIsShiftingTeam(true);
        const updatedHierarchyData = JSON.parse(localStorage.getItem('hierarchyData')); // Fetching hierarchy data from localStorage
    };

    const handleEditClick = () => {
        if (isTeamMember(details)) {
            setIsEditingTeamMember(true);
            setOption(getAllTeamNames(details));
        } else if (details.title.includes("Head")) {
        }
        else if (details.teamName) {
            setIsEditingTeam(true);
        }
        setIsModalVisible(true);
    };

    const handleOk = () => {
        if (isAddingTeam) {
            setFormData(prevState => {
                const updatedChildren = prevState.children ? [...prevState.children, newTeam] : [newTeam];
                const updatedFormData = { ...prevState, children: updatedChildren };
                onDetailsUpdate(updatedFormData);
                return updatedFormData;
            });
            setIsAddingTeam(false);
            setNewTeam({});
        } else if (isEditingTeam) {
            onDetailsUpdate({ ...formData, teamName: formData.teamName });
            setIsEditingTeam(false);
        } else if (isEditingTeamMember) {
            onDetailsUpdate(formData);
        } else if (isShiftingTeam) {
            const hierarchyData = JSON.parse(localStorage.getItem('hierarchyData')); // Fetching hierarchy data from localStorage

            const updatedHierarchyData = shiftTeamMember(hierarchyData, formData, selectedOption);
            onDetailsUpdate(updatedHierarchyData)
            setIsShiftingTeam(false);
        } else {
            onDetailsUpdate(formData);
        }
        setIsModalVisible(false);
        setIsAddingMember(false);
        setNewMemberIndex(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsAddingMember(false);
        setNewMemberIndex(null);
        setIsEditingTeam(false);
        setIsAddingTeam(false);
        setNewTeam({});
        setIsEditingTeamMember(false);
        setIsShiftingTeam(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isAddingTeam) {
            setNewTeam(prevState => ({ ...prevState, [name]: value }));
        } else if (isEditingTeam) {
            setFormData(prevState => ({ ...prevState, teamName: value }));
        } else {
            setFormData(prevState => {
                if (newMemberIndex !== null) {
                    const updatedChildren = prevState.children.map((child, index) => {
                        if (index === newMemberIndex) {
                            return { ...child, [name]: value };
                        }
                        return child;
                    });
                    return { ...prevState, children: updatedChildren };
                } else {
                    return { ...prevState, [name]: value };
                }
            });
        }
    };

    const handlePromoteClick = () => {
        if (isTeamMember(details)) {
            // Promote Team Member to Team Leader
            const updatedDetails = {
                ...details,
                title: "Team leader"
            };
            onDetailsUpdate(updatedDetails);
        } else if (details.title === "Team leader") {
            // Promote Team Leader to Head of Department
            promoteTeamLeader(details);
        } else if (details.title.includes("Head")) {
            promoteHead(details)
        }
    };


    const promoteTeamLeader = (teamLeaderDetails) => {
        // Fetch hierarchy data from localStorage
        const hierarchyData = JSON.parse(localStorage.getItem('hierarchyData'));

        // Find the parent node of the team leader
        const parentNode = findParentNode(hierarchyData, findParentNode(hierarchyData, teamLeaderDetails));

        console.log(parentNode)

        let newParentNode = {
            ...parentNode,
            name: teamLeaderDetails.name,
            email: teamLeaderDetails.email,
            phone: teamLeaderDetails.phone
        }

        console.log(newParentNode)
        onDetailsUpdate(newParentNode)

    };


    const promoteHead = (headDetails) => {
        // Fetch hierarchy data from localStorage
        const hierarchyData = JSON.parse(localStorage.getItem('hierarchyData'));

        // Find the parent node of the team leader
        const parentNode = findParentNode(hierarchyData, headDetails);

        console.log(parentNode)

        let newParentNode = {
            ...parentNode,
            name: headDetails.name,
            email: headDetails.email,
            phone: headDetails.phone
        }

        console.log(newParentNode)
        onDetailsUpdate(newParentNode)

    }

    const updateHierarchyNode = (node, updatedNode) => {
        if (JSON.stringify(node) === JSON.stringify(updatedNode)) {
            return updatedNode;
        }
        if (node.children) {
            const updatedChildren = node.children.map(child => updateHierarchyNode(child, updatedNode));
            return { ...node, children: updatedChildren };
        }
        return node;
    };

    const handleAddTeamMember = () => {
        const newMember = {
            title: "Team member",
            name: '',
            email: '',
            phone: ''
        };
        setFormData(prevState => {
            const updatedChildren = prevState.children ? [...prevState.children, newMember] : [newMember];
            return {
                ...prevState,
                children: updatedChildren
            };
        });
        setIsAddingMember(true);
        setNewMemberIndex(formData.children ? formData.children.length : 0);
        setIsModalVisible(true);
    };

    const handleRemoveTeamMember = (index) => {
        const updatedChildren = formData.children.filter((_, idx) => idx !== index);
        setFormData(prevState => {
            const updatedFormData = { ...prevState, children: updatedChildren };
            onDetailsUpdate(updatedFormData);
            return updatedFormData;
        });
    };

    const handleAddTeam = () => {
        setNewTeam({
            title: `Team ${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
            teamName: '',
            children: []
        });
        setIsAddingTeam(true);
        setIsModalVisible(true);
    };

    const isTeamMember = (node) => {
        return node.title === 'Team member';
    };

    const shiftTeamMember = (hierarchyData, teamMember, targetTeamName) => {
        // Helper function to find and remove the team member
        const removeTeamMember = (node, teamMember) => {
            if (node.children) {
                const updatedChildren = node.children.filter(child => {
                    if (child.title === 'Team member' && child.name === teamMember.name) {
                        return false;
                    }
                    removeTeamMember(child, teamMember);
                    return true;
                });
                node.children = updatedChildren;
            }
        };

        // Helper function to add the team member to the target team
        const addTeamMember = (node, teamMember, targetTeamName) => {
            if (node.teamName === targetTeamName && node.children) {
                node.children.push(teamMember);
            } else if (node.children) {
                node.children.forEach(child => addTeamMember(child, teamMember, targetTeamName));
            }
        };

        // Remove the team member from their current team
        removeTeamMember(hierarchyData, teamMember);

        // Add the team member to the target team
        addTeamMember(hierarchyData, teamMember, targetTeamName);

        return hierarchyData;
    };


    const getAllTeamNames = () => {
        const hierarchyData = JSON.parse(localStorage.getItem('hierarchyData')); // Fetching hierarchy data from localStorage
        if (hierarchyData) {
            const parentNode = findParentNode(hierarchyData, findParentNode(hierarchyData, details)); // Find the parent node of the current details node
            const teamNames = [];
            const traverse = (currentNode) => {
                if (currentNode.children) {
                    currentNode.children.forEach(child => {
                        if (child.teamName) {
                            teamNames.push(child.teamName);
                        }
                        traverse(child);
                    });
                }
            };
            traverse(parentNode);
            return (teamNames.filter(item => item !== findParentNode(hierarchyData, details).teamName)
            )
        }
        return [];
    };

    const findParentNode = (node, targetNode) => {
        if (node.children) {
            for (let child of node.children) {
                if (JSON.stringify(child) === JSON.stringify(targetNode)) {
                    return node; // Return the immediate parent node when targetNode is found
                }
                const result = findParentNode(child, targetNode);
                if (result) {
                    return result; // Return the parent node found in deeper recursion
                }
            }
        }
        return null; // Return null if targetNode is not found in the node's children
    };

    const content = (
        <div>
            {details.name && (
                <>
                    <p>Name: {details.name}</p>
                    <p>Email: {details.email}</p>
                    <p>Phone: {details.phone}</p>
                </>
            )}
            {details.teamName && (
                <p>Team Name: {details.teamName}</p>
            )}
            {details.children && details.children.map((member, index) => (
                <p key={index}>
                    {`Team ${member.name ? "Member" : "Name"} ${index + 1}: ${member.name ? member.name : member.teamName}`}
                    <Button type="link" onClick={() => handleRemoveTeamMember(index)}>Remove</Button>
                </p>

            ))}

            {
                (!details.title.endsWith("er") && details.title.includes("Team")) && (
                    <Button type="link" onClick={handleAddTeamMember}>Add Team Member</Button>
                )
            }


            <Button type="link" onClick={handleEditClick}>Edit</Button>
            {
                details.title.includes("Head") && (

                    <Button type="link" onClick={handleAddTeam}>Add Team</Button>
                )
            }
            {
                details.title.endsWith("member") && (

                    <Button type="link" onClick={handleShiftTeam}>Shift Team</Button>
                )
            }
            {details.title !== 'CEO' && (
                <Button type="link" onClick={handlePromoteClick}>Promote</Button>
            )}

        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'row', margin: 1, alignItems: 'center' }}>
            <div style={{ height: 50 }}>
                <Divider plain style={{ borderColor: 'black', height: '100%' }} type="vertical" />
            </div>
            <div style={{ width: 30, marginLeft: -6 }}>
                <Divider plain style={{ borderColor: 'black' }} />
            </div>
            <Popover content={content} title="Details" trigger="hover">
                <Button style={{ marginLeft: 3 }} type='text'>{text}</Button>
            </Popover>

            {/* Modal for editing details */}
            <Modal
                title={isAddingTeam ? "Add New Team" : isEditingTeam ? "Edit Team Name" : isEditingTeamMember ? "Shift Team Member" : "Edit Information"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form layout="vertical">
                    {isShiftingTeam && (
                        <Select defaultValue={selectedOption} style={{ width: 200 }} onChange={onChange}>
                            {option.map((option, index) => (
                                <Option key={index} value={option}>
                                    {option}
                                </Option>
                            ))}
                        </Select>
                    )}
                    {isAddingTeam || isEditingTeam ? (
                        <Form.Item label="Team Name">
                            <Input name="teamName" value={isAddingTeam ? newTeam.teamName : formData.teamName} onChange={handleChange} />
                        </Form.Item>
                    ) : (
                        !isShiftingTeam && (
                            <>
                                <Form.Item label="Name">
                                    <Input name="name" value={formData.name} onChange={handleChange} />
                                </Form.Item>
                                <Form.Item label="Email">
                                    <Input name="email" value={formData.email} onChange={handleChange} />
                                </Form.Item>
                                <Form.Item label="Phone">
                                    <Input name="phone" value={formData.phone} onChange={handleChange} />
                                </Form.Item>
                            </>
                        )
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default Name;