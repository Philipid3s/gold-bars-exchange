// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GoldBar {
    address public GoldBarOwner;
    string public Reference;
    int256 public AskingPrice;
    address public GoldBarBuyer;
    int256 public OfferPrice;

    enum BarState {
        Available,
        OfferPlaced,
        Accepted
    }

    BarState public State;

    constructor(string memory ref, int256 price) {
        require(price > 0, 'price > 0');
        GoldBarOwner = msg.sender;
        Reference = ref;
        AskingPrice = price;
        State = BarState.Available;
    }

    function MakeOffer(int256 offerPrice) external {
        require(offerPrice > 0, 'offer > 0');
        require(State == BarState.Available, 'not available');
        require(msg.sender != GoldBarOwner, 'owner cannot offer');

        GoldBarBuyer = msg.sender;
        OfferPrice = offerPrice;
        State = BarState.OfferPlaced;
    }

    function AcceptOffer() external {
        require(msg.sender == GoldBarOwner, 'not owner');
        require(State == BarState.OfferPlaced, 'no offer');
        State = BarState.Accepted;
    }

    function Reject() external {
        require(msg.sender == GoldBarOwner, 'not owner');
        require(State == BarState.OfferPlaced, 'no offer');

        GoldBarBuyer = address(0);
        OfferPrice = 0;
        State = BarState.Available;
    }
}
