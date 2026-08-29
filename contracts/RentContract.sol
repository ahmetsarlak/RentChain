// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RentContract {
    address public landlord;
    address public tenant;
    address public arbitrator;

    uint256 public deposit;
    uint256 public monthlyRent;
    uint256 public startTime;
    uint256 public durationMonths;

    bool public depositLocked;
    bool public contractActive;
    bool public disputeRaised;

    constructor(
        address _tenant,
        address _arbitrator,
        uint256 _monthlyRent,
        uint256 _deposit,
        uint256 _durationMonths
    ) {
        landlord = msg.sender;
        tenant = _tenant;
        arbitrator = _arbitrator;
        monthlyRent = _monthlyRent;
        deposit = _deposit;
        durationMonths = _durationMonths;
        startTime = block.timestamp;
        contractActive = true;
    }

    function lockDeposit() public payable {
        require(msg.sender == tenant, "Only tenant can lock deposit");
        require(!depositLocked, "Deposit already locked");
        require(msg.value == deposit, "Incorrect deposit amount");
        depositLocked = true;
    }

    function payRent() public payable {
        require(msg.sender == tenant, "Only tenant can pay rent");
        require(contractActive, "Contract is not active");
        require(msg.value == monthlyRent, "Incorrect rent amount");
        payable(landlord).transfer(msg.value);
    }

    function raiseDispute() public {
        require(msg.sender == landlord || msg.sender == tenant, "Not authorized");
        require(depositLocked, "Deposit is not locked");
        disputeRaised = true;
    }

    function resolveDispute(uint256 landlordAmount) public {
        require(msg.sender == arbitrator, "Only arbitrator can resolve");
        require(disputeRaised, "No dispute raised");
        require(landlordAmount <= address(this).balance, "Insufficient balance");

        disputeRaised = false;
        contractActive = false;

        if (landlordAmount > 0) {
            payable(landlord).transfer(landlordAmount);
        }

        uint256 remaining = address(this).balance;
        if (remaining > 0) {
            payable(tenant).transfer(remaining);
        }
    }

    function endContract() public {
        require(block.timestamp >= startTime + (durationMonths * 30 days), "Duration not over");
        require(!disputeRaised, "Dispute raised, waiting for arbitrator");
        require(contractActive, "Contract already ended");

        contractActive = false;

        if (address(this).balance > 0) {
            payable(tenant).transfer(address(this).balance);
        }
    }
}