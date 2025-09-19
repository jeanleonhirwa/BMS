import React, { useState, useEffect, useCallback } from 'react';
import TransactionForm from '../components/TransactionForm';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });

  const fetchSummaryData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/summary');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  }, []); // Empty dependency array means this function is stable and won't recreate unnecessarily

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(0)} RWF`;
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="summary-cards">
        <div className="card balance">
          <h2>Balance</h2>
          <p>{formatCurrency(summary.balance)}</p>
        </div>
        <div className="card income">
          <h2>Income</h2>
          <p>{formatCurrency(summary.income)}</p>
        </div>
        <div className="card expenses">
          <h2>Expenses</h2>
          <p>{formatCurrency(summary.expenses)}</p>
        </div>
      </div>
      <TransactionForm onTransactionAdded={fetchSummaryData} />
    </div>
  );
};

export default Dashboard;
