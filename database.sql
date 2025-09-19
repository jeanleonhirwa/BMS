-- Create the database
CREATE DATABASE IF NOT EXISTS bms_db;

-- Use the newly created database
USE bms_db;

-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 0) NOT NULL, -- Storing RWF as whole numbers
    description VARCHAR(255) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category_id INT,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insert some default categories (optional)
INSERT IGNORE INTO categories (name) VALUES
('Food'),
('School Supplies'),
('Entertainment'),
('Transport'),
('Savings'),
('Allowance');
