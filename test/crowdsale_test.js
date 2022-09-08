const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Crowdsale", function() {
    let owner
    let buyer
    let token
    let crowdsale

    // sale param
    //10 ** 6 * 10 ** 18
    const total_supply = ethers.utils.parseUnits("1000000.0", 18)
    // 1 EHT = 1000 $ && 1 token = 5 USD --> 1 USD = 10 ^ 15 wei && 1 token = 5 * 10 ^ 15 wei
    const rate = 200

    beforeEach(async function() {
        
        [owner, buyer] = await ethers.getSigners()
        const SWGToken = await ethers.getContractFactory("SWGToken", owner)
        token = await SWGToken.deploy(total_supply)
        await token.deployed()
        
        const MyCrowdsale = await ethers.getContractFactory("Crowdsale", owner)
        crowdsale = await MyCrowdsale.deploy(rate, owner.address, token.address)
        await crowdsale.deployed()
        
    })
    
    it("token deployed parameters", async function(){
        const token_name = "Swag"
        const token_symbol = "SWG"
        
        expect(await token.name()).to.eq(token_name)
        
        expect(await token.symbol()).to.eq(token_symbol)
        
        expect(await token.totalSupply()).to.eq(total_supply)
    })   

    it("crowdsale deployed parameters", async function(){
        expect(await crowdsale.rate()).to.eq(rate)
        
        expect(await crowdsale.wallet()).to.eq(owner.address)
        
        expect(await crowdsale.token()).to.eq(token.address)
    })

    it("crowdsale process", async function(){
        // from owner to sale
        const amount_sale  = total_supply
        
        const tx = await token.connect(owner).transfer(crowdsale.address, amount_sale)
        await tx.wait()

        expect(await token.balanceOf(crowdsale.address)).to.eq(amount_sale)
        
        
        const wei_raised = await crowdsale.weiRaised()
        
        const amount_buy = ethers.utils.parseEther("1.0")
        const txBuyData = {
            value: amount_buy
        }
        
        const txBuy = await crowdsale.connect(buyer).buyTokens(buyer.address, txBuyData)
        await txBuy.wait()

        expect(() => tx()).to.changeEtherBalance(crowdsale, amount_buy)

        expect(await crowdsale.weiRaised()).to.eq(wei_raised + amount_buy)

        //emit and req
        const tx_self = await buyer.sendTransaction({
            to: crowdsale.address,
            value: amount_buy
        })
        await tx_self.wait()
        
        await expect(tx_self)
            .to.emit(crowdsale, "TokensPurchased")
                .withArgs(buyer.address, buyer.address, amount_buy, amount_buy.mul(rate))
        
    })

})