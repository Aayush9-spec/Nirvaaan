"use client";

import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard, Copy, Check, ShieldCheck, X, Loader2, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useBalance } from "wagmi";
import WalletConnect from "@/components/WalletConnect";

const transactions = [
    {
        id: "tx-1",
        type: "outgoing",
        title: "Dr. Sarah Chen - Consultation",
        date: "Feb 14, 2026 • 10:30 AM",
        amount: "- 0.045 ETH",
        status: "Confirmed",
    },
    {
        id: "tx-2",
        type: "outgoing",
        title: "MedShop - Prescription #8821",
        date: "Feb 12, 2026 • 04:15 PM",
        amount: "- 0.012 ETH",
        status: "Confirmed",
    },
];

export default function WalletPageContent() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });

    const [copied, setCopied] = useState(false);
    const [showSend, setShowSend] = useState(false);
    const [showReceive, setShowReceive] = useState(false);
    const [sendAddress, setSendAddress] = useState("");
    const [sendAmount, setSendAmount] = useState("");
    const [ethPrice, setEthPrice] = useState<number | null>(null);

    useEffect(() => {
        // Fetch ETH price from CoinGecko
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
            .then((r) => r.json())
            .then((data) => setEthPrice(data.ethereum?.usd))
            .catch(() => setEthPrice(null));
    }, []);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const usdValue = balance && ethPrice
        ? (parseFloat(balance.formatted) * ethPrice).toFixed(2)
        : null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Web3 Wallet</h1>
                    <p className="text-gray-400 text-sm">Manage your medical payments & insurance</p>
                </div>

                {/* Real Wallet Connect Button */}
                <div className="flex items-center gap-4 self-start sm:self-auto">
                    {isConnected && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-medium">
                            <ShieldCheck size={14} />
                            Secure Connection
                        </div>
                    )}
                    <WalletConnect />
                </div>
            </div>

            {!isConnected ? (
                <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                    <Wallet size={48} className="text-purple-500/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-400 text-center max-w-sm mb-6">
                        To view your balance and process medical payments, please connect your Ethereum wallet (MetaMask, Coinbase, etc).
                    </p>
                    <WalletConnect />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-purple-900/50 to-[#0A0A0A] border border-purple-500/20 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Total Balance</p>
                                    <h2 className="text-4xl font-bold text-white">
                                        {balance ? parseFloat(balance.formatted).toFixed(4) : "0.00"}
                                        <span className="text-lg font-normal text-gray-400 ml-2">{balance?.symbol}</span>
                                    </h2>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {usdValue ? `≈ $${usdValue} USD` : "Fetching price..."}
                                    </p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Wallet className="text-purple-400" size={24} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-8">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 rounded-lg text-sm font-mono text-gray-300 transition-colors border border-white/5"
                                >
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between"
                    >
                        <h3 className="font-semibold text-gray-200 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowSend(true)}
                                className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-purple-600/20 hover:border-purple-600/30 border border-white/5 rounded-xl transition-all group"
                            >
                                <div className="p-2 bg-white/5 rounded-full group-hover:bg-purple-600 text-white transition-colors">
                                    <ArrowUpRight size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-400 group-hover:text-white">Send</span>
                            </button>
                            <button
                                onClick={() => setShowReceive(true)}
                                className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-purple-600/20 hover:border-purple-600/30 border border-white/5 rounded-xl transition-all group"
                            >
                                <div className="p-2 bg-white/5 rounded-full group-hover:bg-purple-600 text-white transition-colors">
                                    <ArrowDownLeft size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-400 group-hover:text-white">Receive</span>
                            </button>
                            <button
                                onClick={() => window.open("https://app.uniswap.org", "_blank")}
                                className="col-span-2 flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors text-sm font-medium text-gray-300"
                            >
                                <CreditCard size={16} /> Buy Crypto
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Send Modal */}
            <AnimatePresence>
                {showSend && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowSend(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Send ETH</h3>
                                <button onClick={() => setShowSend(false)} className="text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Recipient Address</label>
                                    <input
                                        type="text"
                                        value={sendAddress}
                                        onChange={(e) => setSendAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Amount (ETH)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={sendAmount}
                                        onChange={(e) => setSendAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                                <button
                                    disabled={!sendAddress || !sendAmount}
                                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                                >
                                    Send Transaction
                                </button>
                                <p className="text-xs text-gray-500 text-center">Transaction will be signed by your connected wallet</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Receive Modal */}
            <AnimatePresence>
                {showReceive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowReceive(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md text-center"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Receive ETH</h3>
                                <button onClick={() => setShowReceive(false)} className="text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="w-40 h-40 mx-auto bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                    <QrCode size={80} className="text-purple-400" />
                                </div>
                                <p className="text-sm text-gray-400">Send ETH or tokens to this address:</p>
                                <div className="flex items-center justify-center gap-2">
                                    <code className="text-xs font-mono text-gray-300 bg-white/5 px-3 py-2 rounded-lg break-all">
                                        {address}
                                    </code>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transactions */}
            {isConnected && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <History size={18} className="text-gray-400" /> Recent Transactions
                    </h3>
                    <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                        {transactions.map((tx, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                key={tx.id}
                                className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "outgoing" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                                        }`}>
                                        {tx.type === "outgoing" ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-200">{tx.title}</div>
                                        <div className="text-xs text-gray-500">{tx.date}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-mono font-medium ${tx.type === "outgoing" ? "text-white" : "text-green-400"
                                        }`}>
                                        {tx.amount}
                                    </div>
                                    <div className="text-xs text-gray-500">{tx.status}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
