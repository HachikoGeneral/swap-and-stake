import React from 'react'
import { Modal } from "react-bootstrap"
import stakeABI from "../utils/abis/HireMeStake.json"
import approveABI from "../utils/abis/approveABI.json"
import { ethers } from "ethers"


function Stake() {
    const { ethereum } = window;


    const stakeContractAddress = "0x23BeC9418eAe8023EC185f4840E46E3DcFF77028";
    const stakeContractAbi = stakeABI.abi;
    const tokenContractAbi = approveABI.abi;

    //const [modalShow, setModalShow] = React.useState(false);
    const [ethModalShow, setEthModalShow] = React.useState(false);
    const [daiModalShow, setDaiModalShow] = React.useState(false);
    const [hmtModalShow, setHmtModalShow] = React.useState(false);
    const [linkModalShow, setLinkModalShow] = React.useState(false);
    const [unethModalShow, setUnEthModalShow] = React.useState(false);
    const [undaiModalShow, setUnDaiModalShow] = React.useState(false);
    const [unhmtModalShow, setUnHmtModalShow] = React.useState(false);
    const [unlinkModalShow, setUnLinkModalShow] = React.useState(false);
    const [amountWethStaked, setAmountWethStaked] = React.useState();
    const [amountDaiStaked, setAmountDaiStaked] = React.useState();
    const [amountHmtStaked, setAmountHmtStaked] = React.useState();
    const [amountLinkStaked, setAmountLinkStaked] = React.useState();
    const [amountWethRedeemed, setAmountWethRedeemed] = React.useState();
    const [amountDaiRedeemed, setAmountDaiRedeemed] = React.useState();
    const [amountHmtRedeemed, setAmountHmtRedeemed] = React.useState();
    const [amountLinkRedeemed, setAmountLinkRedeemed] = React.useState();
    const [currentAccount, setCurrentAccount] = React.useState();
    const [isClaiming, setIsClaiming] = React.useState(false);

    async function getAccount() {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setCurrentAccount(account);
    }




    function OpenETHModal() {
        return (
            <StakeModal
                show={ethModalShow}
                onHide={() => setEthModalShow(false)}
                name="WETH"
                address="0xd0A1E359811322d97991E03f863a0C30C2cF029C"
            />)
    }

    function OpenDAIModal() {
        return (
            <StakeModal
                show={daiModalShow}
                onHide={() => setDaiModalShow(false)}
                name="DAI"
                address="0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
            />)
    }

    function OpenHMTModal() {
        return (
            <StakeModal
                show={hmtModalShow}
                onHide={() => setHmtModalShow(false)}
                name="HMT"
                address="0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B"
            />)
    }

    function OpenLINKModal() {
        return (
            <StakeModal
                show={linkModalShow}
                onHide={() => setLinkModalShow(false)}
                name="LINK"
                address="0xa36085F69e2889c224210F603D836748e7dC0088"
            />)
    }

    function OpenUNETHModal() {
        return (
            <UnStakeModal
                show={unethModalShow}
                onHide={() => setUnEthModalShow(false)}
                name="WETH"
                address="0xd0A1E359811322d97991E03f863a0C30C2cF029C"
                rewards={amountWethRedeemed}
                staked={amountWethStaked}
            />)
    }

    function OpenUNDAIModal() {
        return (
            <UnStakeModal
                show={undaiModalShow}
                onHide={() => setUnDaiModalShow(false)}
                name="DAI"
                address="0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
                rewards={amountDaiRedeemed}
                staked={amountDaiStaked}
            />)
    }

    function OpenUNHMTModal() {
        return (
            <UnStakeModal
                show={unhmtModalShow}
                onHide={() => setUnHmtModalShow(false)}
                name="HMT"
                address="0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B"
                rewards={amountHmtRedeemed}
                staked={amountHmtStaked}
            />)
    }

    function OpenUNLINKModal() {
        return (
            <UnStakeModal
                show={unlinkModalShow}
                onHide={() => setUnLinkModalShow(false)}
                name="LINK"
                address="0xa36085F69e2889c224210F603D836748e7dC0088"
                rewards={amountLinkRedeemed}
                staked={amountLinkStaked}

            />)
    }

    function StakeModal(props) {
        const [inputData, setInputData] = React.useState({ amount: "" });
        const [isLoading, setIsLoading] = React.useState(false);
        const [isApproved, setIsApproved] = React.useState(false);

        const handleChange = (e) => {
            const { id, value } = e.target;
            setInputData((prevState) => {
                return {
                    ...prevState,
                    [id]: value,
                };
            });
            setIsApproved(false);
        };

        async function Approve() {
            try {
                if (ethereum) {
                    const { amount } = inputData;
                    const parsedAmount = ethers.utils.parseUnits(amount, 18);
                    const provider = new ethers.providers.Web3Provider(ethereum);
                    const signer = provider.getSigner();
                    const tokenContract = new ethers.Contract(props.address, tokenContractAbi, signer);
                    const approval = await tokenContract.approve(stakeContractAddress, parsedAmount);
                    setIsLoading(true);
                    await approval.wait();
                    setIsLoading(false);
                    setIsApproved(true)
                } else {
                    console.log("no ethereum object");
                }
            } catch (error) {
                console.log(error);
                throw new Error("no ethereum object");
            }
        }

        async function stake() {
            try {
                if (ethereum) {
                    const { amount } = inputData;
                    const parsedAmount = ethers.utils.parseUnits(amount, 18);
                    const hmStakeContract = createStakeContract();
                    const tx = await hmStakeContract.deposit(props.address, parsedAmount);
                    setIsLoading(true);
                    await tx.wait();
                    setIsLoading(false);
                    setIsApproved(false);
                    window.location.reload()
                } else {
                    console.log("no ethereum object");
                }
            } catch (error) {
                console.log(error);
                throw new Error("no ethereum object");
            }

        }


        return (
            <div>
                <Modal
                    {...props}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <div className="modal-header bg-dark">
                        <h3 className="modal-title ms-3 text-light" id="staticBackdropLabel">Stake {props.name}</h3>
                        <button type="button" className="btn-close btn-close-white" onClick={props.onHide} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <h5 className='ms-3'>Current {props.name} Staked: {props.staked} {props.name}</h5>
                        <h5 className='ms-3 mt-1 mb-3'>Total Rewards Yielded: {props.rewards} HMT</h5>
                        <hr />
                        <div className="container">
                            <div className="row">
                                <div className="col col-4">
                                    <h5 className='mt-3'> {props.name} To Stake:</h5>
                                </div>
                                <div className="col col-6">
                                    <input type="number" className="form-control mt-2" id="amount" placeholder="Amount" onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-grid gap-2 mb-4 mx-2">
                        <hr />
                        {isLoading ?
                            <button className='btn btn-dark text-light align-items-center' disabled>
                                <h5 className='mt-2'>Loading...</h5>
                            </button>
                            : isApproved ?
                                <button className='btn btn-dark text-light align-items-center' onClick={stake}>
                                    <h5 className='mt-2'>Stake</h5>
                                </button>
                                :
                                <button className='btn btn-dark text-light align-items-center' onClick={Approve}>
                                    <h5 className='mt-2'>Approve Stake</h5>
                                </button>
                        }
                    </div>

                </Modal>
            </div>
        );
    }

    function UnStakeModal(props) {
        const [inputData, setInputData] = React.useState({ amount: "" });
        const [isLoading, setIsLoading] = React.useState(false);

        const handleChange = (e) => {
            const { id, value } = e.target;
            setInputData((prevState) => {
                return {
                    ...prevState,
                    [id]: value,
                };
            });
        };

        async function unStake() {
            try {
                if (ethereum) {
                    const { amount } = inputData;
                    const parsedAmount = ethers.utils.parseUnits(amount, 18);
                    const hmStakeContract = createStakeContract();
                    const tx = await hmStakeContract.withdraw(props.address, parsedAmount);
                    setIsLoading(true);
                    await tx.wait();
                    setIsLoading(false);
                    window.location.reload()
                } else {
                    console.log("no ethereum object");
                }
            } catch (error) {
                console.log(error);
                throw new Error("no ethereum object");
            }

        }

        const handleSubmit = (e) => {
            const { amount } = inputData;

            e.preventDefault();

            if (!amount) return;

            unStake();
        };

        return (
            <div>
                <Modal
                    {...props}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <div className="modal-header bg-dark">
                        <h3 className="modal-title ms-3 text-light" id="staticBackdropLabel">UnStake {props.name}</h3>
                        <button type="button" className="btn-close btn-close-white" onClick={props.onHide} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <h5 className='ms-3'>Current {props.name} Staked: {props.staked} {props.name}</h5>
                        <h5 className='ms-3 mt-1 mb-3'>Total Rewards Yielded: {props.rewards} HMT</h5>
                        <hr />
                        <div className="container">
                            <div className="row">
                                <div className="col col-4 mt-1">
                                    <h5>Amount to unstake:</h5>
                                </div>
                                <div className="col col-6">
                                    <input type="number" className="form-control" id="amount" placeholder="Amount" onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-grid gap-2 mb-4 mx-2">
                        <hr />
                        {isLoading ?
                            <button className='btn btn-dark text-light align-items-center' disabled>
                                <h5 className='mt-2'>Loading...</h5>
                            </button>
                            :
                            <button className='btn btn-dark text-light align-items-center' onClick={handleSubmit}>
                                <h5 className='mt-2'>UNSTAKE</h5>
                            </button>
                        }

                    </div>

                </Modal>
            </div>
        );
    }

    function createStakeContract() {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const hmStakeContract = new ethers.Contract(stakeContractAddress, stakeContractAbi, signer);
        return hmStakeContract;
    }

    async function getAmountsStaked() {
        const hmStakeContract = createStakeContract();
        const wethStaked = await hmStakeContract.amountStaked({ currentAccount }, "0xd0A1E359811322d97991E03f863a0C30C2cF029C");
        const formattedwethStaked = ethers.utils.formatUnits(wethStaked, 18);
        setAmountWethStaked(Number(formattedwethStaked));
        const daiStaked = await hmStakeContract.amountStaked({ currentAccount }, "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa");
        const formatteddaiStaked = ethers.utils.formatUnits(daiStaked, 18);
        setAmountDaiStaked(Number(formatteddaiStaked));
        const hmtStaked = await hmStakeContract.amountStaked({ currentAccount }, "0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B");
        const formattedhmtStaked = ethers.utils.formatUnits(hmtStaked, 18);
        setAmountHmtStaked(Number(formattedhmtStaked));
        const linkStaked = await hmStakeContract.amountStaked({ currentAccount }, "0xa36085F69e2889c224210F603D836748e7dC0088");
        const formattedlinkStaked = ethers.utils.formatUnits(linkStaked, 18);
        setAmountLinkStaked(Number(formattedlinkStaked));

    }

    async function getAmountsRedeemed() {
        const hmStakeContract = createStakeContract();
        const wethRedeemed = await hmStakeContract.amountReedeemed({ currentAccount }, "0xd0A1E359811322d97991E03f863a0C30C2cF029C");
        const formattedwethRedeemed = ethers.utils.formatUnits(wethRedeemed, 18);
        setAmountWethRedeemed(Number(formattedwethRedeemed));
        const daiRedeemed = await hmStakeContract.amountReedeemed({ currentAccount }, "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa");
        const formatteddaiRedeemed = ethers.utils.formatUnits(daiRedeemed, 18);
        setAmountDaiRedeemed(Number(formatteddaiRedeemed));
        const hmtRedeemed = await hmStakeContract.amountReedeemed({ currentAccount }, "0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B");
        const formattedhmtRedeemed = ethers.utils.formatUnits(hmtRedeemed, 18);
        setAmountHmtRedeemed(Number(formattedhmtRedeemed));
        const linkRedeemed = await hmStakeContract.amountReedeemed({ currentAccount }, "0xa36085F69e2889c224210F603D836748e7dC0088");
        const formattedlinkRedeemed = ethers.utils.formatUnits(linkRedeemed, 18);
        setAmountLinkRedeemed(Number(formattedlinkRedeemed));
    }


    async function claim(claimTokenAddress) {
        try {
            if (ethereum) {
                const hmStakeContract = createStakeContract();
                const tx = await hmStakeContract.claimRewards(claimTokenAddress);
                setIsClaiming(true);
                await tx.wait();
                setIsClaiming(false);
                window.location.reload()
            } else {
                console.log("no ethereum object");
            }
        } catch (error) {
            console.log(error);
            throw new Error("no ethereum object");
        }
    }




    React.useEffect(() => {
        getAmountsStaked()
        getAmountsRedeemed()
    }, []);

    React.useEffect(() => {
        getAccount()
    });




    return (
        <div className='bg-dark'>
            <div className='container p-3'>
                <h1 className='display-3 text-light mt-3 Swap-bg'>STAKE</h1>
                <h4 className='text-light mt-1 mb-3'>Earn 1 HMT for every $50 worth tokens staked and claim rewards every 10 seconds</h4>
                <table className="table bg-light rounded p-2 mb-5">
                    <thead>
                        <tr>
                            <th scope="col">Token</th>
                            <th scope="col">Staked</th>
                            <th scope="col">Earned</th>
                            <th scope="col">Stake</th>
                            <th scope="col">UnStake</th>
                            <th scope="col">Claim</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">WETH</th>
                            <td>{amountWethStaked} WETH</td>
                            <td>{amountWethRedeemed} HMT</td>
                            <td>
                                <button className='btn btn-secondary' onClick={() => setEthModalShow(true)}>STAKE</button>
                            </td>
                            <td>
                                <button className='btn btn-secondary' onClick={() => setUnEthModalShow(true)}>UNSTAKE</button>
                            </td>
                            <td>
                                {isClaiming ?
                                    <button className='btn btn-secondary' disabled>Claiming...</button>
                                    :
                                    <button className='btn btn-secondary' onClick={() => claim("0xd0A1E359811322d97991E03f863a0C30C2cF029C")}>CLAIM</button>
                                }

                            </td>
                        </tr>
                        <tr>
                            <th scope="row">DAI</th>
                            <td>{amountDaiStaked} DAI</td>
                            <td>{amountDaiRedeemed} HMT</td>
                            <td>
                                <button className='btn btn-secondary' onClick={() => setDaiModalShow(true)}>STAKE</button>
                            </td>
                            <td>
                                <button className='btn btn-secondary' onClick={() => setUnDaiModalShow(true)}>UNSTAKE</button>
                            </td>
                            <td>
                                {isClaiming ?
                                    <button className='btn btn-secondary' disabled>Claiming...</button>
                                    :
                                    <button className='btn btn-secondary' onClick={() => claim("0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa")}>CLAIM</button>
                                }
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">HMT</th>
                            <td>{amountHmtStaked} HMT</td>
                            <td>{amountHmtRedeemed} HMT</td>
                            <td>
                                <button className='btn btn-secondary' onClick={() => setHmtModalShow(true)}>STAKE</button>
                            </td>
                            <td>
                                <button className='btn btn-secondary' onClick={() => setUnHmtModalShow(true)}>UNSTAKE</button>
                            </td>
                            <td>
                                {isClaiming ?
                                    <button className='btn btn-secondary' disabled>Claiming...</button>
                                    :
                                    <button className='btn btn-secondary' onClick={() => claim("0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B")}>CLAIM</button>
                                }

                            </td>
                        </tr>
                        <tr>
                            <th scope="row">LINK</th>
                            <td>{amountLinkStaked} LINK</td>
                            <td>{amountLinkRedeemed} HMT</td>
                            <td>
                                <button className='btn btn-secondary' onClick={() => setLinkModalShow(true)}>STAKE</button>
                            </td>
                            <td>
                                <button className='btn btn-secondary' onClick={() => setUnLinkModalShow(true)}>UNSTAKE</button>
                            </td>
                            <td>
                                {isClaiming ?
                                    <button className='btn btn-secondary' disabled>Claiming...</button>
                                    :
                                    <button className='btn btn-secondary' onClick={() => claim("0xa36085F69e2889c224210F603D836748e7dC0088")}>CLAIM</button>
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <OpenETHModal
                show={ethModalShow}
                onHide={() => setEthModalShow(false)} />
            <OpenDAIModal
                show={daiModalShow}
                onHide={() => setDaiModalShow(false)} />
            <OpenHMTModal
                show={hmtModalShow}
                onHide={() => setHmtModalShow(false)} />
            <OpenLINKModal
                show={linkModalShow}
                onHide={() => setLinkModalShow(false)} />
            <OpenUNETHModal
                show={unethModalShow}
                onHide={() => setUnEthModalShow(false)} />
            <OpenUNDAIModal
                show={undaiModalShow}
                onHide={() => setUnDaiModalShow(false)} />
            <OpenUNHMTModal
                show={unhmtModalShow}
                onHide={() => setUnHmtModalShow(false)} />
            <OpenUNLINKModal
                show={unlinkModalShow}
                onHide={() => setUnLinkModalShow(false)} />
        </div>
    )
}

export default Stake