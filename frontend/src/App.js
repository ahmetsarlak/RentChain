import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const TENANT_PRIVATE_KEY = "YOUR_TENANT_PRIVATE_KEY";
const ARBITRATOR_PRIVATE_KEY = "YOUR_ARBITRATOR_PRIVATE_KEY";

const RentContractABI = [
  { "inputs": [], "name": "depositLocked", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "lockDeposit", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "payRent", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "raiseDispute", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "contractActive", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "disputeRaised", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "tenant", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "landlord", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "arbitrator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "landlordAmount", "type": "uint256" }], "name": "resolveDispute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const getStyles = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          ${dark ? "#0d1117" : "#f0f2f5"};
    --bg-card:     ${dark ? "#161b22" : "#ffffff"};
    --bg-input:    ${dark ? "#0d1117" : "#f6f8fa"};
    --bg-arb:      ${dark ? "#1a1f2e" : "#eef1f8"};
    --border:      ${dark ? "#30363d" : "#d0d7de"};
    --border-hi:   ${dark ? "#484f58" : "#b0b8c4"};
    --ink:         ${dark ? "#e6edf3" : "#1c2128"};
    --ink-mid:     ${dark ? "#8b949e" : "#57606a"};
    --ink-faint:   ${dark ? "#484f58" : "#9198a1"};
    --accent:      ${dark ? "#388bfd" : "#0969da"};
    --accent-bg:   ${dark ? "#1f3658" : "#dbeafe"};
    --green:       ${dark ? "#3fb950" : "#1a7f37"};
    --green-bg:    ${dark ? "#1a2e1a" : "#dafbe1"};
    --amber:       ${dark ? "#e3b341" : "#9a6700"};
    --amber-bg:    ${dark ? "#2d2108" : "#fff8c5"};
    --red:         ${dark ? "#f85149" : "#cf222e"};
    --red-bg:      ${dark ? "#2d1117" : "#ffebe9"};
    --hash:        ${dark ? "#79c0ff" : "#0550ae"};
  }

  html, body { background: var(--bg); }

  .shell {
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    font-size: 14px;
  }

  .topbar {
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .topbar-left { display: flex; align-items: center; gap: 24px; }

  .wordmark {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 15px;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .wordmark-icon {
    width: 28px;
    height: 28px;
    background: var(--accent);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wordmark-icon svg { display: block; }

  .nav-tag {
    font-size: 11px;
    font-weight: 500;
    color: var(--ink-mid);
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 3px 8px;
    letter-spacing: 0.01em;
  }

  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .hash-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--hash);
    background: var(--accent-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 4px 10px;
    letter-spacing: 0.02em;
  }

  .theme-btn {
    background: var(--bg-input);
    border: 1px solid var(--border);
    color: var(--ink-mid);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: border-color 0.15s, color 0.15s;
  }

  .theme-btn:hover { border-color: var(--border-hi); color: var(--ink); }

  .main {
    flex: 1;
    display: grid;
    grid-template-columns: 300px 1fr;
  }

  .sidebar {
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .contract-id {
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }

  .contract-id-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-mid);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }

  .contract-id-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 10px;
  }

  .contract-id-address {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--hash);
    word-break: break-all;
    line-height: 1.6;
  }

  .contract-id-note {
    margin-top: 10px;
    font-size: 12px;
    color: var(--ink-mid);
    line-height: 1.6;
  }

  .state-section-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-mid);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 10px;
  }

  .state-table {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .state-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 14px;
    border-bottom: 1px solid var(--border);
  }

  .state-row:last-child { border-bottom: none; }

  .state-key {
    font-size: 12px;
    color: var(--ink-mid);
    font-weight: 500;
  }

  .badge {
    font-size: 11px;
    font-weight: 600;
    border-radius: 20px;
    padding: 2px 10px;
    border: 1px solid;
  }

  .badge-green { color: var(--green); background: var(--green-bg); border-color: var(--green); }
  .badge-grey  { color: var(--ink-faint); background: var(--bg-input); border-color: var(--border); }
  .badge-amber { color: var(--amber); background: var(--amber-bg); border-color: var(--amber); }

  .connect-btn {
    width: 100%;
    padding: 10px 16px;
    background: var(--accent);
    border: none;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: opacity 0.15s;
    letter-spacing: -0.01em;
  }

  .connect-btn:hover { opacity: 0.88; }

  .conn-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    transition: background 0.3s;
  }

  .conn-dot.active { background: #3fb950; }

  .content {
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .content-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.02em;
  }

  .content-subtitle {
    font-size: 12px;
    color: var(--ink-mid);
    margin-top: 2px;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
  }

  .action-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-card:hover {
    border-color: var(--border-hi);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .action-card.danger:hover { border-color: var(--red); }

  .action-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .action-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-icon.blue  { background: var(--accent-bg); }
  .action-icon.green { background: var(--green-bg); }
  .action-icon.red   { background: var(--red-bg); }

  .action-icon svg { display: block; }

  .action-eth {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-mid);
  }

  .action-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .action-desc {
    font-size: 12px;
    color: var(--ink-mid);
    line-height: 1.5;
    margin-top: 2px;
  }

  .action-card.danger .action-name { color: var(--red); }

  .action-trigger {
    margin-top: auto;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.01em;
  }

  .action-card.danger .action-trigger { color: var(--red); }

  .arb-panel {
    background: var(--bg-arb);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 24px;
  }

  .arb-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .arb-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--amber);
    background: var(--amber-bg);
    border: 1px solid var(--amber);
    border-radius: 4px;
    padding: 2px 8px;
  }

  .arb-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .arb-desc {
    font-size: 12px;
    color: var(--ink-mid);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .arb-input-row {
    display: flex;
    gap: 10px;
    align-items: stretch;
  }

  .input-wrap {
    flex: 1;
    position: relative;
  }

  .amount-input {
    width: 100%;
    padding: 10px 80px 10px 14px;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.15s;
    height: 100%;
  }

  .amount-input::placeholder { color: var(--ink-faint); }
  .amount-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-bg); }

  .eth-suffix {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-mid);
    pointer-events: none;
    font-family: 'JetBrains Mono', monospace;
  }

  .btn-resolve {
    padding: 10px 20px;
    background: var(--amber);
    border: none;
    color: #000;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 700;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity 0.15s;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .btn-resolve:hover { opacity: 0.88; }

  .status-log {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--green);
    line-height: 1.6;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .log-prefix { color: var(--ink-faint); user-select: none; }

  .footer {
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    padding: 12px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--ink-mid);
  }

  .footer-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--green);
  }

  .footer-address {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--hash);
    letter-spacing: 0.02em;
  }
`;

const IconLock = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconCoin = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 6v2m0 8v2M9.5 9.5C9.5 8.1 10.6 7 12 7s2.5 1.1 2.5 2.5c0 2.5-5 2.5-5 5C9.5 15.9 10.6 17 12 17s2.5-1.1 2.5-2.5"/>
  </svg>
);

const IconAlert = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
);

const IconSun = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconMoon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function App() {
  const [dark, setDark] = useState(true);
  const [status, setStatus] = useState("");
  const [depositLocked, setDepositLocked] = useState(false);
  const [contractActive, setContractActive] = useState(false);
  const [disputeRaised, setDisputeRaised] = useState(false);
  const [arbitratorAmount, setArbitratorAmount] = useState("");
  const [connected, setConnected] = useState(false);

  async function connectAndRead() {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const wallet = new ethers.Wallet(TENANT_PRIVATE_KEY, provider);
      const rentContract = new ethers.Contract(CONTRACT_ADDRESS, RentContractABI, wallet);
      setDepositLocked(await rentContract.depositLocked());
      setContractActive(await rentContract.contractActive());
      setDisputeRaised(await rentContract.disputeRaised());
      const balance = await provider.getBalance(wallet.address);
      setConnected(true);
      setStatus("Wallet connected. Balance: " + ethers.formatEther(balance) + " ETH");
    } catch (error) {
      setStatus("Error: " + (error.reason || error.message));
    }
  }

  async function lockDeposit() {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const wallet = new ethers.Wallet(TENANT_PRIVATE_KEY, provider);
      const rentContract = new ethers.Contract(CONTRACT_ADDRESS, RentContractABI, wallet);
      const tx = await rentContract.lockDeposit({ value: ethers.parseEther("1") });
      await tx.wait();
      setDepositLocked(true);
      setStatus("Deposit locked. Tx: " + tx.hash);
    } catch (error) {
      setStatus("Error: " + (error.reason || error.message));
    }
  }

  async function payRent() {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const wallet = new ethers.Wallet(TENANT_PRIVATE_KEY, provider);
      const rentContract = new ethers.Contract(CONTRACT_ADDRESS, RentContractABI, wallet);
      const tx = await rentContract.payRent({ value: ethers.parseEther("0.5") });
      await tx.wait();
      setStatus("Rent payment confirmed. Tx: " + tx.hash);
    } catch (error) {
      setStatus("Error: " + (error.reason || error.message));
    }
  }

  async function raiseDispute() {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const wallet = new ethers.Wallet(TENANT_PRIVATE_KEY, provider);
      const rentContract = new ethers.Contract(CONTRACT_ADDRESS, RentContractABI, wallet);
      const tx = await rentContract.raiseDispute();
      await tx.wait();
      setDisputeRaised(true);
      setStatus("Dispute raised. Awaiting arbitrator. Tx: " + tx.hash);
    } catch (error) {
      setStatus("Error: " + (error.reason || error.message));
    }
  }

  async function resolveDispute() {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const wallet = new ethers.Wallet(ARBITRATOR_PRIVATE_KEY, provider);
      const rentContract = new ethers.Contract(CONTRACT_ADDRESS, RentContractABI, wallet);
      const amount = ethers.parseEther(arbitratorAmount || "0.3");
      const tx = await rentContract.resolveDispute(amount);
      await tx.wait();
      setDisputeRaised(false);
      setContractActive(false);
      setStatus("Dispute resolved. Funds distributed. Tx: " + tx.hash);
    } catch (error) {
      setStatus("Error: " + (error.reason || error.message));
    }
  }

  const accentColor = dark ? "#388bfd" : "#0969da";
  const greenColor  = dark ? "#3fb950" : "#1a7f37";
  const redColor    = dark ? "#f85149" : "#cf222e";

  return (
    <>
      <style>{getStyles(dark)}</style>
      <div className="shell">

        <div className="topbar">
          <div className="topbar-left">
            <div className="wordmark">
              <div className="wordmark-icon"><IconHome /></div>
              RentChain
            </div>
            <span className="nav-tag">Lease Contract</span>
          </div>
          <div className="topbar-right">
            <span className="hash-chip">{CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}</span>
            <button className="theme-btn" onClick={() => setDark(d => !d)}>
              {dark ? <IconSun /> : <IconMoon />}
              {dark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>

        <div className="main">
          <aside className="sidebar">
            <div className="contract-id">
              <div className="contract-id-label">Contract</div>
              <div className="contract-id-title">On-Chain<br />Lease Agreement</div>
              <div className="contract-id-address">{CONTRACT_ADDRESS}</div>
              <div className="contract-id-note">
                Transactions are recorded immutably on the blockchain and cannot be reversed.
              </div>
            </div>

            <div>
              <div className="state-section-label">Contract State</div>
              <div className="state-table">
                <div className="state-row">
                  <span className="state-key">Security Deposit</span>
                  <span className={`badge ${depositLocked ? "badge-green" : "badge-grey"}`}>
                    {depositLocked ? "Locked" : "Unlocked"}
                  </span>
                </div>
                <div className="state-row">
                  <span className="state-key">Contract Status</span>
                  <span className={`badge ${contractActive ? "badge-green" : "badge-grey"}`}>
                    {contractActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="state-row">
                  <span className="state-key">Open Dispute</span>
                  <span className={`badge ${disputeRaised ? "badge-amber" : "badge-grey"}`}>
                    {disputeRaised ? "Raised" : "None"}
                  </span>
                </div>
              </div>
            </div>

            <button className="connect-btn" onClick={connectAndRead}>
              <span>Connect as Tenant</span>
              <span className={`conn-dot ${connected ? "active" : ""}`} />
            </button>
          </aside>

          <div className="content">
            <div className="content-header">
              <div>
                <div className="content-title">Tenant Actions</div>
                <div className="content-subtitle">Select an action to submit a transaction to the contract</div>
              </div>
            </div>

            <div className="actions-grid">
              <div className="action-card" onClick={lockDeposit}>
                <div className="action-card-top">
                  <div className="action-icon blue">
                    <IconLock color={accentColor} />
                  </div>
                  <span className="action-eth">1.00 ETH</span>
                </div>
                <div>
                  <div className="action-name">Lock Deposit</div>
                  <div className="action-desc">Send security deposit into escrow. Held until lease ends or dispute is resolved.</div>
                </div>
                <span className="action-trigger">Execute transaction →</span>
              </div>

              <div className="action-card" onClick={payRent}>
                <div className="action-card-top">
                  <div className="action-icon green">
                    <IconCoin color={greenColor} />
                  </div>
                  <span className="action-eth">0.50 ETH</span>
                </div>
                <div>
                  <div className="action-name">Pay Rent</div>
                  <div className="action-desc">Transfer monthly rent directly to landlord wallet via smart contract.</div>
                </div>
                <span className="action-trigger">Execute transaction →</span>
              </div>

              <div className="action-card danger" onClick={raiseDispute}>
                <div className="action-card-top">
                  <div className="action-icon red">
                    <IconAlert color={redColor} />
                  </div>
                  <span className="action-eth">—</span>
                </div>
                <div>
                  <div className="action-name">Raise Dispute</div>
                  <div className="action-desc">Flag a breach of contract. Escalates to arbitrator for independent resolution.</div>
                </div>
                <span className="action-trigger">Raise dispute →</span>
              </div>
            </div>

            <div className="arb-panel">
              <div className="arb-header">
                <span className="arb-badge">Restricted</span>
                <span className="arb-title">Arbitrator Panel</span>
              </div>
              <div className="arb-desc">
                Accessible only by the designated arbitrator wallet. Enter the ETH amount to award the landlord; the remainder returns to the tenant.
              </div>
              <div className="arb-input-row">
                <div className="input-wrap">
                  <input
                    className="amount-input"
                    value={arbitratorAmount}
                    onChange={(e) => setArbitratorAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <span className="eth-suffix">ETH → Landlord</span>
                </div>
                <button className="btn-resolve" onClick={resolveDispute}>
                  Resolve &amp; Distribute
                </button>
              </div>
            </div>

            {status && (
              <div className="status-log">
                <span className="log-prefix">$&gt;</span>
                {status}
              </div>
            )}
          </div>
        </div>

        <div className="footer">
          <div className="footer-left">
            <span className="footer-dot" />
            <span>Network: Hardhat Local — Block 8545</span>
          </div>
          <span className="footer-address">{CONTRACT_ADDRESS}</span>
        </div>

      </div>
    </>
  );
}