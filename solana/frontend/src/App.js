import "./App.css";
import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl, TransactionInstruction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN
} from "@project-serum/anchor";
import { useEffect, useState } from 'react';
import { Buffer } from "buffer";
import Carousel from "nuka-carousel";

window.Buffer = Buffer;

const programId = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
};
const { SystemProgram } = web3;

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [funds, setFunds] = useState([]);
  const [amount, setAmount] = useState(0);
  const [selectedFundPubKey, setSelectedFund] = useState(null);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection, 
      window.solana, 
      opts.preflightCommitment);
    return provider;
  }

  const chckIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        console.log("Phantom wallet found!");
        const response = await solana.connect({
          onlyIfTrusted: true
        });
        console.log(
          "Connected with public key:",
          response.publicKey.toString()
        );
        setWalletAddress(response.publicKey.toString())
      } else {
        alert("Need Phantom wallet to be connected!")
      }
    } catch (error) {
      console.error(error)
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana && solana.isPhantom) {
      const response = await solana.connect();
      console.log(
        'Connected with pubkey: ',
        response.publicKey.toString()
      );
      setWalletAddress(response.publicKey.toString());
    }
  };

  const createFund = async () => {
    try {
      let provider = getProvider();
      let program = new Program(idl, programId, provider);

      let [fund] = await PublicKey.findProgramAddress(
        [
          utils.bytes.utf8.encode("CROWDFUNDING"),
          provider.wallet.publicKey.toBuffer()
        ],
        program.programId
      );
      await program.rpc.create("The Fund", "description", {
        accounts: {
          fund: fund,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        }
      });
      console.log("Fund created:", fund.toString())
    } catch (error) {
      console.error("Error creating a fund account:", error);
      alert("Unable to create a Fund")
    }
  }

  const getAllFunds = async () => {
    setSelectedFund(null);
    setAmount(0);

    let connection = new Connection(network, opts.preflightCommitment);
    let provider = getProvider();
    let program = new Program(idl, programId, provider);
    Promise.all(
      (await connection.getProgramAccounts(programId)).map(
        async fund => ({
          ...(await program.account.fund.fetch(fund.pubkey)),
          pubkey: fund.pubkey
        })
      )
    ).then((funds) => setFunds(funds));
  }

  const donate = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);

      await program.rpc.donate(new BN(amount*LAMPORTS_PER_SOL), {
        accounts: {
          fund: selectedFundPubKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      alert("Thank you for the donation!");
      getAllFunds();
    } catch (error) {
      console.error("Error donating:", error);
      alert("Failed to Donate")
    }
  }

  const withdraw = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);

      let connection = new Connection(network, opts.preflightCommitment);
      let selectedFundData = await connection.getAccountInfo(selectedFundPubKey);
      
      await program.rpc.withdraw(new BN(selectedFundData.lamports - 0.5 * LAMPORTS_PER_SOL), {
        accounts: {
          fund: selectedFundPubKey,
          user: provider.wallet.publicKey
        },
      });
      alert("Funds withdrawn");
      getAllFunds();
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Failed to Withdaw")
    }
  }

  const handleAmount = (e) => setAmount(e.target.value);

  const isOwner = async () => {
    try {
      const provider = getProvider();

      let connection = new Connection(network, opts.preflightCommitment);
      let selectedFundData = await connection.getAccountInfo(selectedFundPubKey);
      
      return provider.wallet.publicKey.toString() === selectedFundData.creator.toString();
      
    } catch (error) {
      console.error("Error getting user details:", error);
    }
  }

  const containerPhantomNotConnected = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%'
    }}>
      <button onClick={connectWallet}>Connect to Phantom</button>
    </div>
  )

  const containerDonate = (fund) => (
    <>
      <div>
        <input class="effect-5" type="text" placeholder="0"/>
              <span class="focus-border"></span> SOL
      </div>
      <button onClick={donate}>Donate Me</button>
    </>
  )

  const containerWithdraw = () => (
    <>
      <button onClick={withdraw}>Withdraw All</button>
    </>
  )

  const fundsCarousel = () => (
    <Carousel>
      {funds.map(fund => (
        <div className="fundCard" key={fund.pubkey.toString()}>
          <div className="fundInfo">
            <h2>{fund.name}</h2>
            <p>Fund Address: {fund.pubkey.toString()}</p>
            <p>Fund Balance: {(fund.sumDonated/ web3.LAMPORTS_PER_SOL).toString()} SOL</p>
            <p>{fund.description}</p>
            <button onClick={() => setSelectedFund(fund.pubkey)}>Select Fund</button>
            <br/>
          </div>
          {selectedFundPubKey && (
          <div className="fundActivity">
            {containerDonate(fund)}
            <br/>
            {isOwner() && containerWithdraw()}
          </div>)}
        </div>
      ))}
      </Carousel>
  )

  const containerAddFund = () => (
    <>
    </>
  )

  const containerActions = () => (
    <>
      <button onClick={createFund}>Create a new Fund</button>
      <button onClick={getAllFunds}>Show All Funds</button>
    </>
  )

  useEffect(() => {
    const onLoad = async () => {
      await chckIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad)
  }, []);

  return (
    <>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@100&display=swap" rel="stylesheet"/>
    <div className="App"><div className='activity' style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {!walletAddress && containerPhantomNotConnected()}
      {walletAddress && containerActions()}
      </div>
      <div>{funds.length > 0 && fundsCarousel()}</div>
      <div className="addFund"></div>
    </div>
    </>
    )

};
