import { useState, useEffect } from 'react';
import { useDisconnect, useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { type Address, formatUnits, parseUnits, erc20Abi } from 'viem'
import { useReadContract, useWriteContract, usePublicClient } from 'wagmi'
import { BANK_CONTRACT_ADDRESS, BANK_CONTRACT_ABI, ERC20_ADDRESS } from '../config/contracts'
import './BankApp.css'

export default function BankApp() {
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState('');
    const [isApproved, setIsApproved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const publicClient = usePublicClient();
    const [isDarkMode, setIsDarkMode] = useState(true);  // 添加主题状态

    // 查询余额
    const { data: bankBalance, refetch: refetchBalance } = useReadContract({
        address: BANK_CONTRACT_ADDRESS,
        abi: BANK_CONTRACT_ABI,
        functionName: 'balances',
        args: [address as Address],
        query: {
            enabled: Boolean(address),
        }
    });

    // 检查授权
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: ERC20_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address as Address, BANK_CONTRACT_ADDRESS],
        query: {
            enabled: Boolean(address),
        }
    });

    // 合约操作
    const { writeContract: deposit } = useWriteContract();
    const { writeContract: withdraw } = useWriteContract();
    const { writeContract: approve } = useWriteContract();


    // 在连接钱包后自动查询余额
    useEffect(() => {
        if (isConnected && address) {
            handleGetBalance();
        } else {
            setBalance('');
        }
    }, [isConnected, address]);

    // 在余额变化后自动更新显示
    useEffect(() => {
        if (bankBalance) {
            const formattedBalance = formatUnits(bankBalance, 18);
            const displayBalance = Number(formattedBalance).toFixed(6);
            setBalance(`${displayBalance}`);
        }
    }, [bankBalance]);

    // 检查授权状态
    useEffect(() => {
        if (allowance !== undefined && amount) {
            // 检查授权额度是否足够当前要质押的金额
            const requiredAmount = parseUnits(amount, 18);
            setIsApproved(allowance >= requiredAmount);
        } else if (allowance !== undefined) {
            // 如果没有输入金额，只要有授权就算已授权
            setIsApproved(allowance > 0n);
        }
    }, [allowance, amount]);  // 添加 amount 作为依赖

    // 处理余额查询
    const handleGetBalance = async () => {
        try {
            await refetchBalance();
            if (bankBalance) {
                const formattedBalance = formatUnits(bankBalance, 18);
                const displayBalance = Number(formattedBalance).toFixed(6);
                setBalance(`${displayBalance}`);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    // 添加等待交易确认的函数
    const waitForTransaction = async (hash: `0x${string}`) => {
        try {
            setProgress(50);  // 提高进度显示
            const receipt = await publicClient?.waitForTransactionReceipt({ hash });
            setProgress(100);
            // 等待进度条动画完成后再隐藏
            await new Promise(resolve => setTimeout(resolve, 500));
            return receipt;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        } finally {
            setProgress(0);
            setIsLoading(false);
        }
    };

    // 修改 handleApprove
    const handleApprove = async () => {
        if (!amount || !publicClient) return;
        setIsLoading(true);
        setProgress(10);
        try {
            const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
            const hash = await approve({
                address: ERC20_ADDRESS,
                abi: erc20Abi,
                functionName: 'approve',
                args: [BANK_CONTRACT_ADDRESS, maxUint256],
            });
            await waitForTransaction(hash);
            await refetchAllowance();
            handleDeposit(true);
        } catch (error) {
            console.error('Error approving:', error);
        }
    };

    // 修改 handleDeposit
    const handleDeposit = async (skipApprovalCheck = false) => {
        if (!amount || !publicClient) return;
        try {
            const depositAmount = parseUnits(amount, 18);
            
            if (!skipApprovalCheck && (!isApproved || (allowance && allowance < depositAmount))) {
                await handleApprove();
                return;
            }

            setIsLoading(true);
            setProgress(25);  // 开始交易时显示更明显的进度
            const hash = await deposit({
                address: BANK_CONTRACT_ADDRESS,
                abi: BANK_CONTRACT_ABI,
                functionName: 'deposit',
                args: [depositAmount],
            });
            await waitForTransaction(hash);
            await refetchBalance();  // 立即刷新余额
            setAmount('');
        } catch (error) {
            console.error('Error depositing:', error);
        }
    };

    // 修改 handleWithdraw
    const handleWithdraw = async () => {
        if (!amount || !publicClient) return;
        try {
            setIsLoading(true);
            setProgress(25);  // 开始交易时显示更明显的进度
            const hash = await withdraw({
                address: BANK_CONTRACT_ADDRESS,
                abi: BANK_CONTRACT_ABI,
                functionName: 'withdraw',
                args: [parseUnits(amount, 18)],
            });
            await waitForTransaction(hash);
            await refetchBalance();  // 立即刷新余额
            setAmount('');
        } catch (error) {
            console.error('Error withdrawing:', error);
        }
    };

    // 切换主题函数
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="card">
                <div className="header">
                    <h1 className="title">Bank dApp</h1>
                    <button 
                        className="theme-toggle" 
                        onClick={toggleTheme}
                    >
                        {isDarkMode ? '🌞' : '🌙'}
                    </button>
                </div>
                {!isConnected ? (
                    <button className="connect-button" onClick={() => open()}>Connect Wallet</button>
                ) : (
                    <div className="content">
                        <div className="wallet-info">
                            <span className="address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                            <button className="disconnect-button" onClick={() => disconnect()}>
                                Disconnect
                            </button>
                        </div>

                        <div className="swap-container">
                            <div className="balance-display" style={{ marginBottom: '20px' }}>
                                <span className="balance-label">Balance:</span>
                                <span className="balance-amount">{balance} Tokens</span>
                            </div>

                            <div className="input-container">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.0"
                                    className="token-input"
                                />
                                <span className="token-symbol">Token</span>
                            </div>

                            <div className="actions">
                                <button
                                    className="action-button deposit"
                                    onClick={() => handleDeposit()}
                                    disabled={!amount}
                                >
                                    {isApproved ? 'Deposit' : 'Approve Token'}
                                </button>
                                <button
                                    className="action-button withdraw"
                                    onClick={handleWithdraw}
                                    disabled={!amount}
                                >
                                    Withdraw
                                </button>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="progress-container">
                                <div className="progress-text">
                                    {progress < 100 ? 'Transaction in progress...' : 'Transaction completed!'}
                                </div>
                                <div 
                                    className="progress-bar" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}