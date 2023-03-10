// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MyContract {
    uint256 internal value;

    event ValueChanged(uint256 newValue);

    function setValue(uint256 _value) public {
        value = _value;
        emit ValueChanged(_value);
    }

    function getValue() public view returns (uint256) {
        return value;
    }

    function version() public pure returns (uint256) {
        return 1;
    }
}
