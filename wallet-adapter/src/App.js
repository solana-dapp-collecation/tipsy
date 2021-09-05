import "./App.css";
import React, { useEffect, useRef, useMemo, useState } from "react";
import Wallet from "@project-serum/sol-wallet-adapter";
import { Connection, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";
function toHex(buffer: Buffer) {
  return Array.prototype.map
    .call(buffer, (x: number) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

function App() {
  const [logs, setLogs] = useState([]);
  function addLog(log: string) {
    setLogs((logs) => [...logs, log]);
  }
  const recipient = useRef(null);
  const amount = useRef(null);
  const network = "devnet";
  const [providerUrl, setProviderUrl] = useState("https://www.sollet.io");
  let connection = new Connection(clusterApiUrl('devnet'));
  const urlWallet = useMemo(
    () => new Wallet(providerUrl, network),
    [providerUrl, network]
  );

  const [selectedWallet, setSelectedWallet] = useState();
  const [, setConnected] = useState(false);
  useEffect(() => {
    if (selectedWallet) {
      selectedWallet.on("connect", () => {
        setConnected(true);
        addLog(
          `Connected to wallet ${selectedWallet.publicKey?.toBase58() ?? "--"}`
        );
      });
      selectedWallet.on("disconnect", () => {
        setConnected(false);
        addLog("Disconnected from wallet");
      });
      void selectedWallet.connect();
      return () => {
        void selectedWallet.disconnect();
      };
    }
  }, [selectedWallet]);

  async function transferSol() {
    try {
      if (!selectedWallet) {
        throw new Error("wallet not connected");
      }
      let transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: selectedWallet.publicKey,
          toPubkey: recipient.current.value,
          lamports: amount.current.value,
        })
      );

      let { blockhash } = await connection.getRecentBlockhash();

      addLog("Blockhash: " + blockhash);
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = selectedWallet.publicKey;

      let signed = await selectedWallet.signTransaction(transaction);

      addLog("Signed Tx: " + signed);
      let txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid);
      addLog("Transaction complete: Transaction Id -  " + txid);
    } catch (e) {
      console.warn(e);
    }
  }

  return (
    <div className="App">
      <h1>Wallet Demo</h1>
      <div>Network: {network}</div>
      <div>
        Waller provider:{" "}
        <input
          type="text"
          value={providerUrl}
          onChange={(e) => setProviderUrl(e.target.value.trim())}
        />
      </div>
      {selectedWallet && selectedWallet.connected ? (
        <div>
          <div>Wallet address: {selectedWallet.publicKey?.toBase58()}.</div>
          <label> Enter a public key: </label>
          <input type="text" ref={recipient} name="recipient" />
          <label> Enter amount to transfer (in Lamports): </label>
          <input type="text" ref={amount} name="amount" />

          <button onClick={transferSol}>Transfer SOL</button>
          <button onClick={() => selectedWallet.disconnect()}>
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedWallet(urlWallet)}>
            Connect to Wallet
          </button>
        </div>
      )}
      <hr />
      <div className="logs">
        {logs.map((log, i) => (
          <>
            {" "}
            <div key={i}>{log}</div>
            <br />
          </>
        ))}
      </div>
    </div>
  );
}

export default App;
