// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MedAIPayment
 * @dev Smart contract for handling healthcare payments on MedAI platform
 */
contract MedAIPayment is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event PaymentReceived(
        address indexed patient,
        address indexed provider,
        uint256 amount,
        string appointmentId,
        uint256 timestamp
    );
    
    event PaymentRefunded(
        address indexed patient,
        uint256 amount,
        string appointmentId,
        uint256 timestamp
    );
    
    event ProviderWithdrawal(
        address indexed provider,
        uint256 amount,
        uint256 timestamp
    );

    // Structs
    struct Payment {
        address patient;
        address provider;
        uint256 amount;
        string appointmentId;
        uint256 timestamp;
        bool refunded;
        bool withdrawn;
    }

    // State variables
    mapping(string => Payment) public payments;
    mapping(address => uint256) public providerBalances;
    mapping(address => bool) public verifiedProviders;
    
    uint256 public platformFeePercentage = 5; // 5% platform fee
    uint256 public totalPlatformFees;
    
    // Modifiers
    modifier onlyVerifiedProvider() {
        require(verifiedProviders[msg.sender], "Not a verified provider");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Make a payment for an appointment
     * @param appointmentId Unique appointment identifier
     * @param provider Address of the healthcare provider
     */
    function makePayment(
        string memory appointmentId,
        address provider
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(provider != address(0), "Invalid provider address");
        require(verifiedProviders[provider], "Provider not verified");
        require(payments[appointmentId].amount == 0, "Payment already exists");

        uint256 platformFee = (msg.value * platformFeePercentage) / 100;
        uint256 providerAmount = msg.value - platformFee;

        payments[appointmentId] = Payment({
            patient: msg.sender,
            provider: provider,
            amount: msg.value,
            appointmentId: appointmentId,
            timestamp: block.timestamp,
            refunded: false,
            withdrawn: false
        });

        providerBalances[provider] += providerAmount;
        totalPlatformFees += platformFee;

        emit PaymentReceived(
            msg.sender,
            provider,
            msg.value,
            appointmentId,
            block.timestamp
        );
    }

    /**
     * @dev Refund a payment (only within 24 hours and before provider withdrawal)
     * @param appointmentId Unique appointment identifier
     */
    function refundPayment(string memory appointmentId) external nonReentrant {
        Payment storage payment = payments[appointmentId];
        
        require(payment.amount > 0, "Payment does not exist");
        require(payment.patient == msg.sender, "Not the patient");
        require(!payment.refunded, "Already refunded");
        require(!payment.withdrawn, "Provider already withdrawn");
        require(
            block.timestamp <= payment.timestamp + 24 hours,
            "Refund period expired"
        );

        uint256 platformFee = (payment.amount * platformFeePercentage) / 100;
        uint256 providerAmount = payment.amount - platformFee;

        payment.refunded = true;
        providerBalances[payment.provider] -= providerAmount;
        totalPlatformFees -= platformFee;

        (bool success, ) = payable(msg.sender).call{value: payment.amount}("");
        require(success, "Refund transfer failed");

        emit PaymentRefunded(
            msg.sender,
            payment.amount,
            appointmentId,
            block.timestamp
        );
    }

    /**
     * @dev Provider withdraws their balance
     */
    function withdrawProviderBalance() external nonReentrant onlyVerifiedProvider {
        uint256 balance = providerBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        providerBalances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal transfer failed");

        emit ProviderWithdrawal(msg.sender, balance, block.timestamp);
    }

    /**
     * @dev Mark payment as withdrawn (called after provider withdrawal)
     * @param appointmentId Unique appointment identifier
     */
    function markAsWithdrawn(string memory appointmentId) external onlyVerifiedProvider {
        Payment storage payment = payments[appointmentId];
        require(payment.provider == msg.sender, "Not the provider");
        require(!payment.withdrawn, "Already marked as withdrawn");
        
        payment.withdrawn = true;
    }

    /**
     * @dev Add a verified provider (only owner)
     * @param provider Address of the healthcare provider
     */
    function addVerifiedProvider(address provider) external onlyOwner {
        require(provider != address(0), "Invalid provider address");
        verifiedProviders[provider] = true;
    }

    /**
     * @dev Remove a verified provider (only owner)
     * @param provider Address of the healthcare provider
     */
    function removeVerifiedProvider(address provider) external onlyOwner {
        verifiedProviders[provider] = false;
    }

    /**
     * @dev Update platform fee percentage (only owner)
     * @param newFeePercentage New fee percentage (0-100)
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 20, "Fee too high"); // Max 20%
        platformFeePercentage = newFeePercentage;
    }

    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 fees = totalPlatformFees;
        require(fees > 0, "No fees to withdraw");

        totalPlatformFees = 0;

        (bool success, ) = payable(owner()).call{value: fees}("");
        require(success, "Fee withdrawal failed");
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get payment details
     * @param appointmentId Unique appointment identifier
     */
    function getPayment(string memory appointmentId) 
        external 
        view 
        returns (
            address patient,
            address provider,
            uint256 amount,
            uint256 timestamp,
            bool refunded,
            bool withdrawn
        ) 
    {
        Payment memory payment = payments[appointmentId];
        return (
            payment.patient,
            payment.provider,
            payment.amount,
            payment.timestamp,
            payment.refunded,
            payment.withdrawn
        );
    }

    /**
     * @dev Get provider balance
     * @param provider Address of the healthcare provider
     */
    function getProviderBalance(address provider) external view returns (uint256) {
        return providerBalances[provider];
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
