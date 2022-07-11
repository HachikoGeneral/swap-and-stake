import React from 'react'
import wethicon from "../images/wethicon.png"
import hmticon from "../images/hmticon.png"
import daiicon from "../images/daiicon.png"
import linkicon from "../images/linkicon.png"
import swapABI from "../utils/abis/HireMeSwap.json"
import approveABI from "../utils/abis/approveABI.json"
import { Modal } from "react-bootstrap"
import { ethers, BigNumber } from "ethers"



function Swap() {
    const { ethereum } = window;
    const swapContractAddress = "0x2609172beD21Db65759caD7c048EECdd582671B0";
    const swapContractAbi = swapABI.abi;
    const tokenContractAbi = approveABI.abi;

    const [isConnected, setIsConnected] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isApproved, setIsApproved] = React.useState(false);
    const [accounts, setAccounts] = React.useState([]);
    const [modalShow, setModalShow] = React.useState(false);
    const [fromTokenSelected, setFromTokenSelected] = React.useState("WETH");
    const [toTokenSelected, setToTokenSelected] = React.useState("HMT");
    const [isFrom, setIsFrom] = React.useState(true);
    const [fromTokenAddress, setFromTokenAddress] = React.useState("0xd0A1E359811322d97991E03f863a0C30C2cF029C");
    const [toTokenAddress, setToTokenAddress] = React.useState("0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B");
    const [inputData, setInputData] = React.useState({ amount: "" });
    const [ouputData, setOutputData] = React.useState("Output Amount...");






    const TokenCard = ({ icon, name }) => (
        <div className="container">
            <div className='row justify-content-center align-items-center'>
                <div className='col col-4'>
                    <img src={icon} alt="ethy" />
                </div>
                <div className='col col-4 mt-2'>
                    <h3>{name}</h3>
                </div>
            </div>
        </div>
    );

    function createSwapContract() {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const hmSwapContract = new ethers.Contract(swapContractAddress, swapContractAbi, signer);
        return hmSwapContract;
    }

    function selectToken(token) {
        isFrom ? setFromTokenSelected(token) : setToTokenSelected(token);
        isFrom ? getFromAddress(token) : getToAddress(token);
        setModalShow(false);
        setIsApproved(false);
        setInputData({ amount: "" });
    }

    function getFromAddress(token) {
        if (token === "WETH") {
            setFromTokenAddress("0xd0A1E359811322d97991E03f863a0C30C2cF029C")
        } else if (token === "DAI") {
            setFromTokenAddress("0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa")
        } else if (token === "LINK") {
            setFromTokenAddress("0xa36085F69e2889c224210F603D836748e7dC0088")
        } else {
            setFromTokenAddress("0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B")
        }
    }

    function getToAddress(token) {
        if (token === "WETH") {
            setToTokenAddress("0xd0A1E359811322d97991E03f863a0C30C2cF029C")
        } else if (token === "DAI") {
            setToTokenAddress("0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa")
        } else if (token === "LINK") {
            setToTokenAddress("0xa36085F69e2889c224210F603D836748e7dC0088")
        } else {
            setToTokenAddress("0x8ADc4D9E41eeC6Ef65C310FCEbeFC28e14ed2d1B")
        }
    }

    function openFromModal() {
        setIsFrom(true);
        setModalShow(true);
    }

    function OpenToModal() {
        setIsFrom(false);
        setModalShow(true);
    }


    function ChooseTokenModal(props) {
        return (
            <div>
                <Modal
                    {...props}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <div className="modal-header">
                        <h3 className="modal-title ms-3" id="staticBackdropLabel">Select A Token</h3>
                        <button type="button" className="btn-close" onClick={props.onHide} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-grid gap-2 mx-2 mb-2">
                            <button className="btn btn-dark" onClick={() => selectToken("WETH")} >
                                <TokenCard
                                    icon={wethicon}
                                    name="WETH" />
                            </button>
                            <button className="btn btn-dark" onClick={() => selectToken("DAI")}>
                                <TokenCard
                                    icon={daiicon}
                                    name="DAI" />
                            </button>
                            <button className="btn btn-dark" onClick={() => selectToken("HMT")}>
                                <TokenCard
                                    icon={hmticon}
                                    name="Hire Me Token" />
                            </button>
                            <button className="btn btn-dark" onClick={() => selectToken("LINK")}>
                                <TokenCard
                                    icon={linkicon}
                                    name="Chainlink" />
                            </button>
                        </div>
                    </div>

                </Modal>
            </div>
        );
    }

    async function connectToMetamask() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await ethereum.request({ method: "eth_requestAccounts" });
                setAccounts(await ethereum.request({ method: "eth_accounts" }));
                console.log(accounts);
                setIsConnected(true);
            } catch (e) {
                console.log(e);
            }

        }
    }

    function checkIfWalletIsConnect() {
        if (accounts.length > 0) {
            setIsConnected(true);
        } else {
            setIsConnected(false);
        }

    }


    async function approveSwap() {
        try {
            if (ethereum) {
                const { amount } = inputData;
                const parsedAmount = ethers.utils.parseUnits(amount, 18);
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const tokenContract = new ethers.Contract(fromTokenAddress, tokenContractAbi, signer);
                const approval = await tokenContract.approve(swapContractAddress, parsedAmount);
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



    async function makeSwap() {
        try {
            if (ethereum) {
                const { amount } = inputData;
                const parsedAmount = ethers.utils.parseUnits(amount, 18);
                const hmSwapContract = createSwapContract();
                const swap = await hmSwapContract.swap(fromTokenAddress, toTokenAddress, parsedAmount);
                setIsLoading(true);
                await swap.wait();
                setIsLoading(false);
                setIsApproved(false)
                window.location.reload()
            } else {
                console.log("no ethereum object");
            }
        } catch (error) {
            console.log(error);
            throw new Error("no ethereum object");
        }

    }


    async function calculateOutput() {
        const { amount } = inputData;
        if (amount === "") {
            setOutputData("Output Amount...");
        } else {
            const parsedAmount = ethers.utils.parseUnits(amount, 18);
            const hmSwapContract = createSwapContract();
            const output = await hmSwapContract.calculateReturn(fromTokenAddress, toTokenAddress, parsedAmount);
            const bigOutput = BigNumber.from(output);
            const formattedAmount = ethers.utils.formatUnits(bigOutput, 18);
            setOutputData(formattedAmount);
        }
    }



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


    const handleSubmit = (e) => {
        const { amount } = inputData;

        e.preventDefault();

        if (!amount) return;

        makeSwap();
    };


    React.useEffect(() => {
        checkIfWalletIsConnect();
    });

    React.useEffect(() => {
        calculateOutput()
    }, [inputData]);



    return (
        <div className='Swap-bg p-5'>
            <div className='container rounded p-4'>
                <div className='row justify-content-center'>
                    <div className='col col-md-6'>
                        <div className='bg-dark p-3 rounded'>
                            <h3 className='text-light text-start my-1 ms-3'>Swap</h3>
                            <div className='container'>
                                <div className='col'>
                                    <div className='row row-3 my-3 bg-secondary rounded p-3'>
                                        <div className='container'>
                                            <div className='row align-items-center justify-content-between'>
                                                <div className='col col-8'>
                                                    <input type="number" className="form-control" id="amount" placeholder="Amount" onChange={handleChange} />
                                                </div>
                                                <div className='col col-4 mt-2'>
                                                    <div className="d-grid gap-2 mx-2 mb-2">
                                                        <button className='btn btn-light' onClick={() => openFromModal()}>
                                                            {fromTokenSelected}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row row-3 my-3 bg-secondary rounded p-3'>
                                        <div className='container'>
                                            <div className='row align-items-center justify-content-between'>
                                                <div className='col col-8 mt-2'>
                                                    <div className="d-grid gap-2 mx-2 mb-1">
                                                        <button className='btn btn-light text-secondary text-start'>
                                                            {ouputData}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className='col col-4 mt-2'>
                                                    <div className="d-grid gap-2 mx-2 mb-1">
                                                        <button className='btn btn-light' onClick={() => OpenToModal()}>
                                                            {toTokenSelected}
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-grid gap-2 mx-2 mb-1">
                                {!isConnected ?
                                    <button className="btn btn-primary" type="button" onClick={connectToMetamask}>
                                        <h6 className='fw-bold mt-1'>Connect Wallet</h6>
                                    </button>
                                    :
                                    isLoading ?
                                        <button className="btn btn-secondary" type="button" disabled>
                                            <h6 className='fw-bold mt-1'>Loading...</h6>
                                        </button>
                                        : !isApproved ?
                                            <button className="btn btn-secondary" type="button" onClick={approveSwap}>
                                                <h6 className='fw-bold mt-1'>Approve</h6>
                                            </button>
                                            : <button className="btn btn-secondary" type="button" onClick={handleSubmit}>
                                                <h6 className='fw-bold mt-1'>SWAP</h6>
                                            </button>

                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ChooseTokenModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />
        </div>

    )
}

export default Swap