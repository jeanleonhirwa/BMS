import React, { useState, useEffect } from 'react';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/goals');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTarget) return;

    try {
      const response = await fetch('http://localhost:3001/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGoalName, target_amount: parseFloat(newGoalTarget) }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewGoalName('');
      setNewGoalTarget('');
      fetchGoals(); // Refresh the list of goals
    } catch (err) {
      console.error('Error adding goal:', err);
      setError(err.message);
    }
  };

  const handleUpdateGoalProgress = async (goalId, currentAmount) => {
    try {
      const response = await fetch(`http://localhost:3001/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_amount: parseFloat(currentAmount) }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchGoals(); // Refresh the list of goals
    } catch (err) {
      console.error('Error updating goal progress:', err);
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(0)} RWF`;
  };

  if (loading) return <p>Loading goals...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="goals-container">
      <h1>Savings Goals</h1>

      <div className="add-goal-form card">
        <h3>Create New Goal</h3>
        <form onSubmit={handleAddGoal}>
          <div className="form-group">
            <label>Goal Name</label>
            <input
              type="text"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              placeholder="e.g., New Laptop"
              required
            />
          </div>
          <div className="form-group">
            <label>Target Amount</label>
            <input
              type="number"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              placeholder="e.g., 500000"
              required
            />
          </div>
          <button type="submit" className="submit-btn">Add Goal</button>
        </form>
      </div>

      <div className="goals-list">
        {goals.length === 0 ? (
          <p>No savings goals set yet. Create one above!</p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="goal-card card">
              <h3>{goal.name}</h3>
              <p>Target: {formatCurrency(goal.target_amount)}</p>
              <p>Saved: {formatCurrency(goal.current_amount)}</p>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${(goal.current_amount / goal.target_amount) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {((goal.current_amount / goal.target_amount) * 100).toFixed(0)}% Achieved
              </p>
              <div className="goal-actions">
                <input
                  type="number"
                  placeholder="Add amount"
                  onBlur={(e) => handleUpdateGoalProgress(goal.id, parseFloat(goal.current_amount) + parseFloat(e.target.value || 0))}
                />
                <button onClick={() => handleUpdateGoalProgress(goal.id, goal.current_amount - 1000)}>-1000</button>
                <button onClick={() => handleUpdateGoalProgress(goal.id, parseFloat(goal.current_amount) + 1000)}>+1000</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Goals;
