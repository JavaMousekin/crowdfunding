// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

// Import this file to use console.log
import "hardhat/console.sol"; 

contract Crowdfunding {
    uint public available_id;
    address payable public owner;
    enum Priority {
        Urgent, 
        Upcoming, 
        Regular
    }

    struct Fund {
        string name;
        string description;
        uint due_date;
        uint sum_required;
        uint sum_donated;
        bool is_active;
        address owner;
    } 

    constructor () {
        available_id = 1;
        owner = payable(msg.sender);
    }

    mapping(uint => Fund) public funds;

    event Creation(address owner, uint when);

    modifier futureDate(uint _due_date) {
        require(_due_date >= (block.timestamp + 1 days) , "Due date should be in future and at least 1 day past today");
        _;
    }

    function create(
        string memory _name, 
        string memory _description, 
        uint _due_date, 
        uint _sum_required
    ) public futureDate(_due_date){
        Fund memory new_fund = Fund(_name, _description, _due_date, _sum_required, 0, true, msg.sender);
        funds[available_id] = new_fund;
        available_id++;
        emit Creation(msg.sender, block.timestamp);
    }

    function getPriority(uint _due_date) private view returns(Priority){
        uint time_left = _due_date - block.timestamp;
        if (time_left < 1 weeks){
            return Priority.Urgent;
        } 
        if (time_left < 4 weeks){
            return Priority.Upcoming;
        } 
        return Priority.Regular;
    }

    event Donation(address donater, uint when);
    
    modifier isActive(uint _id){
        require(funds[_id].is_active, "The Fund is not gathering money any more");
        _;  
    }

    function donate(uint _id) public payable isActive(_id) {
        owner.transfer(msg.value);
        //(bool sent, bytes memory data) = owner.call{value: msg.value}("");
        //require(sent);

        funds[_id].sum_donated += msg.value;
        emit Donation(msg.sender, block.timestamp);
    }

    event Withdrawal(uint when);

    modifier isOwner(uint _id){
        require(funds[_id].owner == msg.sender, "You're not an owner");
        _;  
    }

    modifier dueDate(uint _id){
        require(block.timestamp > funds[_id].due_date, "You can't withdraw yet");
        _;
    }

    function withdraw(uint _id) public dueDate(_id) isOwner(_id){
        funds[_id].is_active = false;
        address payable owner_address = payable(msg.sender);
        owner_address.transfer(funds[_id].sum_required);
        emit Withdrawal(block.timestamp);
    }

    function getBalance() external view returns(uint) {
        return address(owner).balance;
    }
}
