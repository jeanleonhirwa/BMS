import React, { useState, useEffect, useCallback } from 'react';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({});

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/transactions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(0)} RWF`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const response = await fetch(`http://localhost:3001/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err.message);
    }
  };

  const handleEditClick = (transaction) => {
    setEditingId(transaction.id);
    setEditedTransaction({ ...transaction });
  };

  const handleSaveClick = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(editedTransaction.amount),
          description: editedTransaction.description,
          type: editedTransaction.type,
          category: editedTransaction.category_name, // Use category_name for update
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setEditingId(null);
      fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err.message);
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditedTransaction({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTransaction((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="transactions-container">
      <h1>All Transactions</h1>
      {transactions.length === 0 ? (
        <p>No transactions recorded yet.</p>
      ) : (
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className={transaction.type}>
                  <td>{formatDate(transaction.transaction_date)}</td>
                  {editingId === transaction.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="description"
                          value={editedTransaction.description}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="category_name"
                          value={editedTransaction.category_name}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <select
                          name="type"
                          value={editedTransaction.type}
                          onChange={handleInputChange}
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="amount"
                          value={editedTransaction.amount}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <button onClick={() => handleSaveClick(transaction.id)}>Save</button>
                        <button onClick={handleCancelClick}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{transaction.description}</td>
                      <td>{transaction.category_name}</td>
                      <td>{transaction.type}</td>
                      <td>{formatCurrency(transaction.amount)}</td>
                      <td>
                        <button onClick={() => handleEditClick(transaction)}>Edit</button>
                        <button onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
