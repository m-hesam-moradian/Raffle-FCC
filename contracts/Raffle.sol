// Raffle.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";



// what this lottary platform contract should do:
// 1 when someone found this contract, he get joined to the lottary
// 2 when the lottary is started, the contract will pick a random winner by chainlink vrf 
// 3 the winner will get a reward
// 4 the lottary will be in a loop to keep every specific timeline and this automation will be done by chainlink keeper

contract Raffle is VRFConsumerBaseV2Plus{


    uint256 s_subscriptionId;
    address vrfCoordinator = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 s_keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint32 callbackGasLimit = 40000;
    uint16 requestConfirmations = 3;
    uint32 numWords =  1;
    mapping(uint256 => address) private s_rollers;
    mapping(address => uint256) private s_results;
    uint256 private constant ROLL_IN_PROGRESS = 42;
    // State variables
    address private immutable I_owner;
    address[] private players;
    uint256 private immutable I_TicketPrice;
    uint256 private immutable I_raffleDuration;






    // Events
     event DiceRolled(uint256 indexed requestId, address indexed roller);
     event DiceLanded(uint256 indexed requestId, uint256 indexed result);

    // event RaffleStarted(uint256 duration);
    // event RaffleEnded(address winner, uint256 amount);
    //Errors
    error NotEnoughETH();


    




    // Constructor
    constructor(
        uint256 ticketPrice,
        uint256 raffleDuration,
        uint256 subscriptionId
    )
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        I_owner = msg.sender;
        I_TicketPrice = ticketPrice;
        I_raffleDuration = raffleDuration;
        s_subscriptionId = subscriptionId;
    }

    //payable function to buy ticket as new user to participate in lottory
    function buyTicket() public payable {
        if(msg.value >= I_TicketPrice)
        {
            
        };
        players.push(msg.sender);
    }
    
    // Function to join the raffle
    function rollDice(address roller) public onlyOwner returns (uint256 requestId) {
        require(s_results[roller] == 0, "Already rolled");
        // Will revert if subscription is not set and funded.

       requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
        );

        s_rollers[requestId] = roller;
        s_results[roller] = ROLL_IN_PROGRESS;
        emit DiceRolled(requestId, roller);
    }
    
     function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {

        // transform the result to a number between 1 and 20 inclusively
        uint256 d20Value = (randomWords[0] % 20) + 1;

        // assign the transformed value to the address in the s_results mapping variable
        s_results[s_rollers[requestId]] = d20Value;

        // emitting event to signal that dice landed
        emit DiceLanded(requestId, d20Value);
    }
    }
    // Function to start the raffle