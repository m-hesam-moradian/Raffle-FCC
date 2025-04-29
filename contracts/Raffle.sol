// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.28;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";





//errors
error Raffle__NotEnoughETH();
error Raffle__TransferFaild();

contract Raffle is VRFConsumerBaseV2Plus {
    uint256 immutable s_subscriptionId;
    bytes32 immutable s_keyHash;
    uint256 immutable s_entranceValue;

    uint32 constant CALLBACK_GAS_LIMIT = 100000;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    uint32 constant NUM_WORDS = 2;
    uint256 public s_randomWords;
    address payable[] public  s_players;
   

    uint256 public s_requestId;

    event winnerAddressShower(address indexed winnerAddress);

    constructor(
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash,
        uint256 entranceValue

    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_keyHash = keyHash;
        s_subscriptionId = subscriptionId;
        s_entranceValue = entranceValue;

    }
    function enterRaffle() external payable{
        if (msg.value < s_entranceValue) {
            revert Raffle__NotEnoughETH();
        }
        s_players.push(payable(msg.sender));

    }

    function requestRandomWords() external onlyOwner {
        s_requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
    }

    function sendAmountToWinner(address winnerAddress) internal {
        (bool success, ) = winnerAddress.call{value: address(this).balance}("");
     if(!success) {
            revert Raffle__TransferFaild();
        }
    }
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] calldata randomWords
    ) internal override {
       address s_winnerAddress=s_players [randomWords[0] % s_players.length];

        emit winnerAddressShower(s_winnerAddress);
        sendAmountToWinner( s_winnerAddress);

        
    }
    function getEntranceValue() external view returns (uint256) {
        return s_entranceValue;
    }
}
