'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/add-expense') {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const formData = Buffer.concat(chunks).toString();

      let expense;

      try {
        expense = JSON.parse(formData);
      } catch (err) {
        res.statusCode = 400;

        return res.end('Invalid JSON format');
      }

      const { date, title, amount } = expense;

      if (!date || !title || !amount) {
        res.statusCode = 400;

        return res.end('Missing required fields');
      }

      const filePath = path.join(__dirname, '../db/expense.json');

      try {
        fs.writeFileSync(filePath, JSON.stringify(expense, null, 2), 'utf8');
      } catch (err) {
        res.statusCode = 500;

        return res.end('Failed to save data');
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');

      return res.end(JSON.stringify(expense, null, 2));
    }

    res.statusCode = 404;
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};
