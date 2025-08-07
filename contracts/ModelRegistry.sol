// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ModelRegistry {
    struct Model {
        string hash;
        string version;
        uint256 timestamp;
        address owner;
    }

    mapping(string => Model) public models;

    event ModelRegistered(string indexed hash, string version, address owner);

    function registerModel(
        string memory _hash,
        string memory _version
    ) external {
        require(bytes(models[_hash].hash).length == 0, "Already exists");
        models[_hash] = Model(_hash, _version, block.timestamp, msg.sender);
        emit ModelRegistered(_hash, _version, msg.sender);
    }

    function getModel(
        string memory _hash
    ) external view returns (Model memory) {
        require(bytes(models[_hash].hash).length != 0, "Not found");
        return models[_hash];
    }
}
