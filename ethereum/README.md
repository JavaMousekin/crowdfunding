# Solidity Crowdfunding Project

This project aimed to realise crowdfunding concept using Solidity based Ephereum contract.

Try running some of the following tasks:

## Overview

Contract has the following features:

- create - a new Fund;
- donate - add some money to the Fund;
- withdraw - move gathered money to an owner's wallet if due date has passed;

## Usage

1. Install dependencies: `npm i`

2. Start local node: `npx hardhat node`

3. Deploy `Testament` contract `npx hardhat run scripts/deploy.ts --network localhost`

4. Start hardhat console `npx hardhat console --network localhost`

## Development

Contract follows official [Solidity style guide](https://docs.soliditylang.org/en/v0.8.9/style-guide.html).
Please, review it and follow in your PRs.

The following helper tools are used. Please, run them before raising the PR.

## Testing

Using Hardhat:

```bash
# run full suite
npx hardhat test
# run specific test
npx hardhat test --grep "Should issue testament"
# run tests with coverage
npx hardhat coverage
```