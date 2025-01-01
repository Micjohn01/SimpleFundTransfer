// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
 
contract SimpleFundTransfer {
    address public owner;
    uint public totalAmount;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _; 
    }

    event Deposit(address indexed from, uint amount);
    event Withdrawal(address indexed to, uint amount);
    event Transfer(address indexed from, address indexed to, uint amount);

    function deposit() public payable {
        require(msg.value > 0, "Can't deposit 0 amount");
        totalAmount += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    function withdrawAmount(uint amount) public onlyOwner {
        if (amount <= 0) {
            revert("Can't withdraw 0 amount");
        }
        if (totalAmount < amount) {
            revert("Insufficient funds");
        }
        totalAmount -= amount;

        (bool success,) = owner.call{value: amount}("");
        assert(success);

        emit Withdrawal(owner, amount);
    }

    function transfer(address to, uint amount) public onlyOwner {
        if (amount <= 0) {
            revert("Can't transfer 0 amount");
        }
        if (totalAmount < amount) {
            revert("Insufficient funds");
        }
        totalAmount -= amount;
        
        emit Transfer(owner, to, amount);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
}