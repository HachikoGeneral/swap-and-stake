const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers")


describe("HireMeToken Contract", function () {
    let hmt;
    let provider;
    let add1;
    let add2;
    let owner;

    beforeEach(async function () {
        [add1, add2, owner] = await ethers.getSigners();
        const HireMeToken = await ethers.getContractFactory("HireMeToken");
        hmt = await HireMeToken.connect(owner).deploy();
        provider = waffle.provider;
    });


    describe("HireMeToken", function () {

        it("Should create total supply of 100000000000000000000000000 sent to owner", async function () {
            const totalSupply = BigNumber.from(await hmt.totalSupply());
            const formattedtotalSupply = ethers.utils.formatUnits(totalSupply, 18);
            const expectedSupply = BigNumber.from("100000000000000000000000000")
            const formattedExpectedSupply = ethers.utils.formatUnits(expectedSupply, 18);
            expect(formattedtotalSupply).to.equal(formattedExpectedSupply);
            const ownerBalance = BigNumber.from(await hmt.balanceOf(owner.address));
            const formattedBalance = ethers.utils.formatUnits(ownerBalance, 18);
            expect(formattedtotalSupply).to.equal(formattedBalance);
        });

        it("Should be named Hire Me token", async function () {
            const name = await hmt.name();
            expect(name).to.equal("Hire Me Token")
        });

        it("Should have symbol HMT", async function () {
            const symbol = await hmt.symbol();
            expect(symbol).to.equal("HMT")
        });

        it("Should have 18 decimals", async function () {
            const dec = await hmt.decimals();
            expect(dec).to.equal(18)
        });

        it("Should approve transfer and update allowance", async function () {
            let allowance = await hmt.allowance(owner.address, add1.address)
            expect(allowance).to.equal(0);
            await hmt.connect(owner).approve(add1.address, 100);
            allowance = await hmt.allowance(owner.address, add1.address)
            expect(allowance).to.equal(100);
        });

        it("Should transfer tokens", async function () {
            let add1Bal = await hmt.balanceOf(add1.address);
            expect(add1Bal).to.equal(0)
            await hmt.connect(owner).transfer(add1.address, 100);
            add1Bal = await hmt.balanceOf(add1.address);
            expect(add1Bal).to.equal(100)
        });
    });
})