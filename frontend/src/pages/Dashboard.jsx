import React, { useState, useEffect, useCallback } from 'react';
import TransactionForm from '../components/TransactionForm';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
  const [categorySpending, setCategorySpending] = useState([]);

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
  }, []);

  const fetchCategorySpendingData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/summary/category-spending');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategorySpending(data);
    } catch (error) {
      console.error('Error fetching category spending data:', error);
    }
  }, []);

  useEffect(() => {
    fetchSummaryData();
    fetchCategorySpendingData();
  }, [fetchSummaryData, fetchCategorySpendingData]);

  const handleTransactionAdded = useCallback(() => {
    fetchSummaryData();
    fetchCategorySpendingData();
  }, [fetchSummaryData, fetchCategorySpendingData]);

  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(0)} RWF`;
  };

  const chartData = {
    labels: categorySpending.map(item => item.category_name),
    datasets: [
      {
        data: categorySpending.map(item => item.total_spent),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED',
          '#6A0572', '#AB47BC', '#8D6E63', '#FFD54F', '#78909C', '#C0CA33', '#5C6BC0'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED',
          '#6A0572', '#AB47BC', '#8D6E63', '#FFD54F', '#78909C', '#C0CA33', '#5C6BC0'
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += formatCurrency(context.parsed);
            }
            return label;
          }
        }
      }
    }
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

      <div className="dashboard-content-grid">
        <TransactionForm onTransactionAdded={handleTransactionAdded} />

        {categorySpending.length > 0 && (
          <div className="card chart-card">
            <h2>Spending by Category (Current Month)</h2>
            <div className="chart-container">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
