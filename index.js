const express = require('express');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static('public'));

const promptPath = path.join(__dirname, 'public', 'aww_prompts.txt');
let prompt_mbaymax = '';

fs.readFile(promptPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the prompt file:', err);
        return;
    }
    prompt_mbaymax = data;
});

const csvPath = path.join(__dirname, 'public', 'aww_database.csv');
let csvData = [];

fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
        csvData.push(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

app.post('/message', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const relevantData = csvData
            .filter(row => userMessage.includes(row.Question))
            .map(row => `${row.Question}: ${row.Answers}`)
            .join('\n');

        const fullPrompt = `${prompt_mbaymax}\n\n${relevantData}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: fullPrompt,
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ],
        });

        const botResponse = completion.choices[0].message.content.trim();
        res.json({ message: botResponse });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the response from the GPT API');
    }
});

app.get('/topics', (req, res) => {
    const topics = csvData.reduce((acc, row) => {
        if (!acc[row.Topic]) {
            acc[row.Topic] = { name: row.Topic, questions: [] };
        }
        acc[row.Topic].questions.push({
            question: row.Question,
            answer: row.ShortAnswer, // Ensure this field exists in your CSV
            source: row.Source,
            link: row.Link
        });
        return acc;
    }, {});

    res.json({ topics: Object.values(topics) });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
