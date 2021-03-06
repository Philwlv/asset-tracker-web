import React, { Component } from 'react';
import {
    Container,
    Button,
    Col, Row,
    Jumbotron,
    UncontrolledAlert,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';
import axios from 'axios';
import {
    Link
} from 'react-router-dom';

import {
    BASE_API_PATH
} from "../../../consts";
import IndiAssetMap from '../AllAssets/IndiAssetMap';
import LoadingSpinner from "../../LoadingSpinner";

// Element for "/asset/:assetId?"
// Displays full information about a specific asset
// WIP

function AssetIndiControl(props) {
    return (
        <Row >
            <Col md={2}>
                <h5>{props.deviceName}</h5>
            </Col>
            <Col md={2}>
                <h5>{props.deviceID}</h5>
            </Col>
        </Row>
    );
}

//Will link to DB to collect data
function AssetProperties(props) {
    return (
        <div>
            <Row>
                <Col md={4}>
                    <h6>Device Name:</h6>
                </Col>
                <Col md={8}>
                    <div>{props.deviceName}</div>
                </Col>
            </Row>
            <Row >
                <Col md={4}>
                    <h6>ID:</h6>
                </Col>
                <Col md={8}>
                    <div>{props.deviceID}</div>
                </Col>
            </Row>
            <Row >
                <Col md={4}>
                    <h6>Current Location:</h6>
                </Col>
                <Col md={8}>
                    <div>{props.deviceLocation != null ? props.deviceLocation : "Unknown"}</div>
                </Col>
            </Row>
            <Row >
                <Col md={4}>
                    <h6>Owner Name:</h6>
                </Col>
                <Col md={8}>
                    <div>{props.deviceOwner != null ? props.deviceOwner : "Unknown"}</div>
                </Col>
            </Row>
            <Row >
                <Col md={4}>
                    <h6>Origin:</h6>
                </Col>
                <Col md={8}>
                    <div>{props.deviceOrigin}</div>
                </Col>
            </Row>
            <Row >
                <Col md={4}>
                    <h6>County:</h6>
                </Col>
                <Col md={8}>
                    <div>{props.deviceCounty}</div>
                </Col>
            </Row>
        </div>
    );
}

function DeallocateConfirm(props) {
    return (
        <Modal isOpen={props.isOpen} toggle={props.onToggleModal}>
            <ModalHeader toggle={props.onToggleModal}>Deallocate Asset {props.asset && props.asset.id}</ModalHeader>
            <ModalBody>
                Are you sure you want to deallocate{' '}
                "{props.asset != null && props.asset.display_name}"{' '}
                from{' '}
                "{props.asset != null && props.asset.owner_name}"?

                {
                    props.asset != null && props.asset.owner_date_return &&
                        <div>
                            There is still time left to return this item. Asset is due to be given back on{' '}
                            {props.asset.owner_date_return}
                        </div>
                }
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={props.onConfirm}>Confirm</Button>{' '}
                <Button color="secondary" onClick={props.onToggleModal}>Cancel</Button>
            </ModalFooter>
      </Modal>
    );
}

class SingleAsset extends Component 
{
    constructor(props) {
        super(props);
        
        // Get asset id from Path parameters
        const { params } = this.props.match;
        this.state = {
            id: params.assetId,
            error: "",
            errorVisible: false,
            deallocateModalOpen: false,
            error: "",
        };

        this.toggleDeallocateModal = this.toggleDeallocateModal.bind(this);
        this.confirmDeallocate = this.confirmDeallocate.bind(this);
    }

    componentDidMount() {
        /// Retrieve correct asset from database
        axios({
            method: 'get',
            // No api set up currently, being left for now
            url: `${BASE_API_PATH}/assets/get?id=${this.state.id}`,
            headers: { 'content-type': 'application/json' },
        }).then(result => {
            console.log(result);
            this.setState({
                asset: result.data.asset,
                assetIdLoaded: true,
            });
        }).catch(error => {
            console.log(error);
            this.setState({
                assetIdLoaded: true,
                assetId: "?",
                error: error.message,
            })
        });
    }

    toggleDeallocateModal() {
        this.setState({
            deallocateModalOpen: !this.state.deallocateModalOpen,
        });
    }

    confirmDeallocate() {
        axios({
            method: 'GET',
            url: `${BASE_API_PATH}/assets/deallocate?id=${this.state.id}`,
            headers: { 'content-type': 'application/json' },
        }).then(result => {
            this.setState({
                deallocateConfirm: result.data.changes_set,
            });
            // Reload page once deallocate has succeeded
            if (this.state.deallocateConfirm) {
                window.location.reload();
            }
        }).catch(error => {
            this.setState({
                deallocateConfirm: true,
                error: error.message,
                deallocateModalOpen: true,
            })
        });
    }

    render() {
        return (
            <Container className="my-3">
                {
                    this.state.error && <UncontrolledAlert color="danger">
                                            Error Occured!: {this.state.error}
                                        </UncontrolledAlert>
                }
                <h1>Device</h1>
                <AssetIndiControl deviceName={this.state.asset != null ? this.state.asset.display_name : "Unknown"} deviceID={this.state.id} />
                <Row>
                    <Col md={6} className="h-100">
                        <Row>
                            <Jumbotron className="w-100">
                                {
                                    this.state.asset != null && this.state.assetIdLoaded &&
                                    <AssetProperties 
                                        deviceName={this.state.asset.display_name} 
                                        deviceID={this.state.asset.id}
                                        deviceLocation={this.state.asset.location}
                                        deviceOwner={this.state.asset.owner_name}
                                        deviceOrigin={this.state.asset.origin}
                                        deviceCounty="West Midlands" />
                                }
                                {/* Display loading when asset isn't set and hasn't been loaded */}
                                { this.state.asset == null && !this.state.assetIdLoaded && <LoadingSpinner className="mx-auto" /> }
                                {/* If no asset is set and the load is complete, error occured when loading data */}
                                { this.state.asset == null && this.state.assetIdLoaded && <div>Unable to load any data</div> }
                            </Jumbotron>
                            {
                                this.state.asset != null && this.state.asset.owner_name == null && (
                                    <Link to={this.state.id+'/allocate'}>
                                        <Button color="primary">
                                            Allocate Asset
                                        </Button>
                                    </Link>
                                )
                            }
                            {
                                this.state.asset && this.state.asset.owner_name && (
                                    <Button color="primary" onClick={this.toggleDeallocateModal}>
                                        Deallocate Asset
                                    </Button>
                                )
                            }
                            
                            {/* Deallocate confirm modal */}
                            <DeallocateConfirm isOpen={this.state.deallocateModalOpen} 
                                onConfirm={this.confirmDeallocate} 
                                onToggleModal={this.toggleDeallocateModal} 
                                asset={this.state.asset} />
                        </Row>
                    </Col>
                    <Col md={6}>
                        <div className="w-100 h-100">
                            <IndiAssetMap />
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default SingleAsset;