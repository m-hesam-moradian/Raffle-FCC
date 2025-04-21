// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/dev/vrf/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/dev/vrf/libraries/VRFV2PlusClient.sol";

contract VRFD20 is VRFConsumerBaseV2Plus {
    // State
    address[] public s_players;
    uint256 public s_subscriptionId;
    bytes32 public s_keyHash;
    uint256 public s_requestId;
    uint256 public s_winnerIndex;

    // Constants
    uint32 public constant CALLBACK_GAS_LIMIT = 100000;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 1;

    // Events
    event PlayerEntered(address indexed player);
    event RandomRequestSent(uint256 requestId);
    event WinnerSelected(address indexed winner);

    // Errors
    error NotEnoughETH();
    error TransferFailed();
    error NoPlayers();

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 keyHash
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
        s_keyHash = keyHash;
    }

    // Enter the lottery
    function enterLottory() external payable {
        if (msg.value < 0.1 ether) revert NotEnoughETH();
        s_players.push(msg.sender);
        emit PlayerEntered(msg.sender);
    }

    // Request randomness
    function requestRandomWinner() external {
        if (s_players.length == 0) revert NoPlayers();

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

        emit RandomRequestSent(s_requestId);
    }

    // Called by Chainlink when random words are ready
    function fulfillRandomWords(
        uint256, // requestId
        uint256[] memory randomWords
    ) internal override {
        s_winnerIndex = randomWords[0] % s_players.length;
        address winner = s_players[s_winnerIndex];
        _sendAmountToWinner(winner);
        emit WinnerSelected(winner);
    }

    // Send all ETH to winner
    function _sendAmountToWinner(address winner) internal {
        uint256 amount = address(this).balance;
        (bool success, ) = winner.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    // View winner address (after selection)
    function getWinner() external view returns (address) {
        require(s_players.length > 0, "No players");
        return s_players[s_winnerIndex];
    }

    // View all players
    function getAllPlayers() external view returns (address[] memory) {
        return s_players;
    }
}
