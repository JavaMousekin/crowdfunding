# Solidity Crowdfunding Project

This project aimed to realise crowdfunding concept using Solidity-based Ephereum contract.

## Вackground
### Problem 
- There are some **users**, who need a specific sets of staff - clothes, shoes, ammunition etc.;
- There are some **volunteers** who are ready to help to find, buy and deliver that staff to the user;
- There are some **donors** who are ready to donate some money for that purpose;
- There are some **providers** who are ready to sell the required goods.

### Existing Solution:
- User raise a request to the Volunteer, who contacts Provider and agreed on some price, 
and gather the required amount of money, then one delivers the goods to the user

### Trust Breach
- Volunteer may spend gathered money on some other purpose;
- Provider may increase prices during the gathering process;
- Volunteer may not deliver goods;

### Additional issues
- User request may change during the gathering process;

## Overview
Contract has the following features:

- create - a new Fund;
- donate - add some money to the Fund;
- withdraw - move gathered money to an owner's wallet if due date has passed;

## Usage

1. Install dependencies: `npm i`

2. Start local node: `npx hardhat node`

3. Deploy `Crowdfunding` contract `npx hardhat run scripts/deploy.ts --network localhost`

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

## TODOes
1) Add UI;
2) Implement IPLD with https://github.com/multiformats/js-multiformats;