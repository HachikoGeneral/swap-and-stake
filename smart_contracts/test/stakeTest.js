const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HireMeStake Contract", function () {
    let hms;
    let hmt;
    let owner;
    let add1;

    const expectError = async (promise, error) => {
        try {
            await promise;
        } catch (e) {
            expect(e.message).includes(error);
            return;
        }
        expect(false);
    }


    beforeEach(async function () {
        [add1, add2, owner] = await ethers.getSigners();
        const HireMeStake = await ethers.getContractFactory("HireMeStake");
        hms = await HireMeStake.connect(owner).deploy();
        const HireMeToken = await ethers.getContractFactory("HireMeToken");
        hmt = await HireMeToken.connect(owner).deploy();

    });


    describe("HireMeStake", function () {
        it("Should add AllowedToken", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a")
            const isAllowed = await hms.isAllowed(hmt.address);
            expect(isAllowed).to.equal(true);
        });

        it("Should not add Allow Token if not owner", async function () {
            expectError(hms.connect(add1).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a"), "Only owner can do this");
        });

        it("Should remove allowed tokens", async function () {
            await hms.connect(owner).removeAllowedToken("0xd0A1E359811322d97991E03f863a0C30C2cF029C");
            const isAllowed = await hms.isAllowed("0xd0A1E359811322d97991E03f863a0C30C2cF029C");
            expect(isAllowed).to.equal(false);
        });

        it("Should not remove allowed token if not owner", async function () {
            expectError(hms.connect(add1).removeAllowedToken("0xd0A1E359811322d97991E03f863a0C30C2cF029C"), "Only owner can do this");
        });

        it("Should deposit and get amount staked", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a")
            await hmt.connect(owner).approve(hms.address, 100);
            await hms.connect(owner).deposit(hmt.address, 100);
            let balance = await hms.amountStaked(owner.address, hmt.address);
            expect(balance).to.equal(100);
        });

        it("Should not deposit if token not allowed", async function () {
            expectError(hms.connect(owner).deposit("0x777A68032a88E5A84678A77Af2CD65A7b3c0775a", 100), "this token is not allowed");
        });

        it("Should not deposit if amout <=0", async function () {
            expectError(hms.connect(owner).deposit(hmt.address, 0), "You must deposit more than 0");
        });

        it("Should withdraw", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a");
            await hmt.connect(owner).approve(hms.address, 100);
            await hms.connect(owner).deposit(hmt.address, 100);
            await hms.connect(owner).withdraw(hmt.address, 100);
            let balance = await hms.amountStaked(owner.address, hmt.address);
            expect(balance).to.equal(0);
        });

        it("Should not withdraw if token not allowed", async function () {
            expectError(hms.connect(owner).withdraw(hmt.address, 100), "this token is not allowed");
        });

        it("Should not withdraw if not a staker", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a");
            expectError(hms.connect(owner).withdraw(hmt.address, 100), "You dont have anything staked");
        });

        it("Should not withdraw if don't have enough staked", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a");
            await hmt.connect(owner).approve(hms.address, 100);
            await hms.connect(owner).deposit(hmt.address, 100);
            expectError(hms.connect(owner).withdraw(hmt.address, 200), "You dont have enough staked");
        });

        it("Should not claim rewards if token not allowed", async function () {
            expectError(hms.connect(owner).claimRewards(hmt.address), "this token is not allowed");
        });

        it("Should not withdrawHMT if not owner", async function () {
            expectError(hms.connect(add1).withdrawHMT(), "Only owner can do this");
        });

    });
})
