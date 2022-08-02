import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import dayjs from "dayjs";


type Fund = {
    name: string;
    description: string;
    dueDate: number;
    sumRequired: number;
    sumDonated: number;
    isActive: boolean;
    owner: string;
};

describe("Crowdfunding", function () {
    async function deployCrowdfundingFixture() {
        const TWO_DAYS_IN_SECS = 2 * 24 * 60 * 60;
        const ONE_GWEI = 1_000_000_000;
        const dueDate = (await time.latest()) + TWO_DAYS_IN_SECS;
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const validFund: Fund = {
            name: "Name",
            description: "Description",
            dueDate: dueDate,
            sumRequired: ONE_GWEI,
            sumDonated: 0,
            isActive: true,
            owner: owner.address
        }

        const invalidFund: Fund = {
            name: "Name",
            description: "Description",
            sumRequired: ONE_GWEI,
            dueDate: (await time.latest()),
            sumDonated: 0,
            isActive: false,
            owner: owner.address
        }

        const factory = await ethers.getContractFactory("Crowdfunding");
        const contract = await factory.deploy();

        return { contract, validFund, invalidFund, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { contract, owner } = await loadFixture(deployCrowdfundingFixture);

            expect(await contract.owner()).to.equal(owner.address);
        });
    });

    describe("Creation", function () {
        describe("Date Validation", function () {
            it("Should revert if due date is not in future", async function () {
                const { contract, invalidFund } = await loadFixture(
                    deployCrowdfundingFixture
                );

                await expect(contract.create(invalidFund.name, invalidFund.description, invalidFund.dueDate, invalidFund.sumRequired)).to.be.revertedWith(
                    "Due date should be in future and at least 1 day past today"
                );
            });
        });
        describe("Happy-pass", function () {
            it("Should create new fund with valid due date", async function () {
                const { contract, validFund } = await loadFixture(
                    deployCrowdfundingFixture
                );
                await contract.create(validFund.name, validFund.description, validFund.dueDate, validFund.sumRequired)
                const fundId = parseInt((await contract.available_id())._hex, 16) - 1;
                const { name, description, due_date, sum_required, sum_donated, is_active, owner } = await contract.funds(fundId);
                const fundInContract: Fund = {
                    name: name,
                    description: description,
                    dueDate: parseInt(due_date._hex, 16),
                    sumDonated: parseInt(sum_donated._hex, 16),
                    sumRequired: parseInt(sum_required._hex, 16),
                    isActive: is_active,
                    owner: owner
                }
                expect(fundInContract).to.be.deep.equal(validFund);
            });
        });
        describe("Donation", function () {
            describe("Is Active Validation", function () {
                const timestamp = time.latest().then((t) => dayjs.unix(t).add(1, "minute").unix());
            });
        });
    })
});
