// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
 
contract SimpleFundTransfer {
    address public owner;
    uint public totalAmount;
    uint public withdrawalLimit = 1 ether;
    bool public isPaused = false;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _; 
    }

     modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    event Deposit(address indexed from, uint amount);
    event Withdrawal(address indexed to, uint amount);
    event Transfer(address indexed from, address indexed to, uint amount);
    event Paused(address indexed by);
    event Resumed(address indexed by);

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

    // Individual balances tracking
    mapping(address => uint) public balances;

    function getIndividualBalance(address account) public view returns (uint) {
        return balances[account];
    }

    // Whitelist functionality
    mapping(address => bool) public whitelist;

    function addToWhitelist(address account) public onlyOwner {
        whitelist[account] = true;
    }

    function removeFromWhitelist(address account) public onlyOwner {
        whitelist[account] = false;
    }

    function transferToWhitelisted(address to, uint amount) public onlyOwner {
        require(whitelist[to], "Address not whitelisted");
        require(totalAmount >= amount, "Insufficient funds");

        totalAmount -= amount;

        (bool success,) = to.call{value: amount}("");
        require(success, "Transfer failed");

        emit Transfer(owner, to, amount);
    }

    // Withdraw all funds
    function withdrawAll() public onlyOwner {
        uint amount = address(this).balance;
        require(amount > 0, "No funds to withdraw");

        totalAmount = 0;

        (bool success,) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(owner, amount);
    }

    // Set withdrawal limit
    function setWithdrawalLimit(uint newLimit) public onlyOwner {
        withdrawalLimit = newLimit;
    }

    // Pause the contract
    function pause() public onlyOwner {
        isPaused = true;
        emit Paused(msg.sender);
    }

    // Resume the contract
    function resume() public onlyOwner {
        isPaused = false;
        emit Resumed(msg.sender);
    }
    
}