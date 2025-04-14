'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar } from "../components/ui/avatar";
import { formatUnits } from "ethers";
import { ethers } from "ethers";

export default function PulseBank() {
  const [wallet, setWallet] = useState("0x");
  const [plsBalance, setPlsBalance] = useState("0.00");
  const [tokens, setTokens] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState("0.00");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!ethers.utils.isAddress(wallet)) return;
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://rpc.pulsechain.com");
        const balance = await provider.getBalance(wallet);
        const formatted = parseFloat(formatUnits(balance, 18)).toFixed(4);
        setPlsBalance(formatted);
      } catch (err) {
        setPlsBalance("0.00");
      }
    };

    const fetchTokens = async () => {
      if (!ethers.utils.isAddress(wallet)) return;
      try {
        const res = await fetch(`https://scan.pulsechain.com/api?module=account&action=tokenlist&address=${wallet}`);
        const data = await res.json();
        if (data?.result) {
          const tokenList = data.result;
          const tokenAddresses = tokenList.map((t) => t.tokenAddress.toLowerCase());

          const query = `{
            tokens(where: {id_in: [${tokenAddresses.map((addr) => `\"${addr}\"`).join(",")}]) {
              id
              symbol
              name
              derivedUSD
            }
          }`;

          const priceRes = await fetch("https://graph.pulsechain.com/subgraphs/name/pulsex/exchange-v2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
          });

          const priceData = await priceRes.json();
          const priceMap = {};
          priceData.data.tokens.forEach((t) => {
            priceMap[t.id] = parseFloat(t.derivedUSD);
          });

          let totalValue = 0;
          const enriched = tokenList.map((t) => {
            const rawBalance = parseFloat(t.tokenBalance) / 10 ** t.tokenDecimal;
            const price = priceMap[t.tokenAddress.toLowerCase()] || 0;
            const value = rawBalance * price;
            totalValue += value;
            return { ...t, displayBalance: rawBalance.toFixed(4), usdValue: value.toFixed(2) };
          });

          setTokens(enriched);
          setPortfolioValue(totalValue.toFixed(2));
        } else {
          setTokens([]);
          setPortfolioValue("0.00");
        }
      } catch (err) {
        setTokens([]);
        setPortfolioValue("0.00");
      }
    };

    const fetchTransactions = async () => {
      if (!ethers.utils.isAddress(wallet)) return;
      try {
        const res = await fetch(`https://scan.pulsechain.com/api?module=account&action=txlist&address=${wallet}`);
        const data = await res.json();
        if (data?.result) {
          setTransactions(data.result.slice(0, 10));
        } else {
          setTransactions([]);
        }
      } catch (err) {
        setTransactions([]);
      }
    };

    fetchBalance();
    fetchTokens();
    fetchTransactions();
  }, [wallet]);

  return (
    <div className="min-h-screen bg-[#0d0f1c] text-white px-6 py-4">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">PulseBank</h1>
        <Input
          placeholder="Paste wallet address"
          className="w-80 bg-[#1a1d2e] border-none"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
      </header>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="bg-[#1a1d2e] mb-4">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <Card className="bg-[#1a1d2e] border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 bg-gray-600" />
                <div>
                  <p className="text-lg font-semibold">{wallet || "0x..."}</p>
                  <p className="text-sm text-gray-400">PulseChain</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-bold">${portfolioValue}</p>
                <p className="text-sm text-gray-500">Total Portfolio Value</p>
              </div>
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Tokens</h2>
                {tokens.length === 0 ? (
                  <p className="text-sm text-gray-500">No tokens found.</p>
                ) : (
                  <ul className="space-y-2">
                    {tokens.map((token, idx) => (
                      <li key={idx} className="flex justify-between items-center border-b border-gray-700 py-2">
                        <div>
                          <p className="text-sm font-medium">{token.tokenName}</p>
                          <p className="text-xs text-gray-400">{token.tokenSymbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{token.displayBalance}</p>
                          <p className="text-xs text-gray-400">${token.usdValue}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfts">
          <Card className="bg-[#1a1d2e] border-none">
            <CardContent className="p-6">No NFTs found.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-[#1a1d2e] border-none">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-500">No transaction history available.</p>
              ) : (
                <ul className="space-y-3">
                  {transactions.map((tx, idx) => (
                    <li key={idx} className="border-b border-gray-700 pb-2">
                      <p className="text-sm font-medium">Hash: <span className="text-blue-400">{tx.hash.slice(0, 10)}...</span></p>
                      <p className="text-xs text-gray-400">From: {tx.from.slice(0, 6)}... To: {tx.to?.slice(0, 6) || 'Contract'}...</p>
                      <p className="text-xs text-gray-500">Block: {tx.blockNumber} | Time: {new Date(tx.timeStamp * 1000).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        Built for PulseChain • Inspired by DeBank
      </footer>
    </div>
  );
}
