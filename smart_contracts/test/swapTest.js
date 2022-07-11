const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HireMeSwap Contract", function () {
    let hms;
    let hmt;
    let provider;
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
        const HireMeSwap = await ethers.getContractFactory("HireMeSwap");
        hms = await HireMeSwap.connect(owner).deploy();
        const HireMeToken = await ethers.getContractFactory("HireMeToken");
        hmt = await HireMeToken.connect(owner).deploy();


    });


    describe("HireMeSwap", function () {

        it("Should add AllowedToken", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a")
            const isAllowed = await hms.isAllowedToken(hmt.address);
            expect(isAllowed).to.equal(true);
        });

        it("Should not add Allow Token if not owner", async function () {
            expectError(hms.connect(add1).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a"), "Only owner can do this");
        });

        it("Should not add AllowedToken if token already allowed", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a");
            expectError(hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a"), "This token is already allowed");
        });

        it("Should deposit to pool and get pool balance", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a")
            await hmt.connect(owner).approve(hms.address, 100);
            await hms.connect(owner).depositPoolToken(hmt.address, 100);
            let balance = await hms.getPoolBalance(hmt.address);
            expect(balance).to.equal(100);
        });

        it("Should not deposit to pool if not owner", async function () {
            expectError(hms.connect(add1).depositPoolToken(hmt.address, 100), "Only owner can do this");
        });

        it("Should not deposit to pool if token not allowed", async function () {
            expectError(hms.connect(owner).depositPoolToken(hms.address, 100), "this token is not allowed");
        });


        it("Should withdrawl from pool", async function () {
            await hms.connect(owner).addAllowedToken(hmt.address, "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a")
            await hmt.connect(owner).approve(hms.address, 100);
            await hms.connect(owner).depositPoolToken(hmt.address, 100);
            await hms.connect(owner).withdrawPoolToken(hmt.address);
            let balance = await hms.getPoolBalance(hmt.address);
            expect(balance).to.equal(0);
        });

        it("Should not withdrawl from pool if not owner", async function () {
            expectError(hms.connect(owner).withdrawPoolToken(hmt.address), "Only owner can do this");
        });

        it("Should not swap if amount is <= 0", async function () {
            expectError(hms.connect(owner).swap("0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B", "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa", 0), "You must swap more than 0");
        });

        it("Should not swap if swap is not allowed", async function () {
            expectError(hms.connect(owner).swap("0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B", "0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B", 100), "This swap is not allowed");
        });

    });
})

