document.addEventListener('DOMContentLoaded', function() {
    loadTopics();
});

async function sendMessage(message) {
    if (!message) {
        var input = document.getElementById('message-input');
        message = input.value.trim();
        if (message === '') return;
        input.value = '';
    }

    displayMessage(message, 'user');

    try {
        const response = await fetch('/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        const data = await response.json();
        displayMessage(data.message, 'mbaymax');
    } catch (error) {
        console.error('Error fetching response:', error);
    }
}

function displayMessage(message, senderClass) {
    var messagesContainer = document.getElementById('messages');
    var messageDiv = document.createElement('div');
    messageDiv.classList.add('message', senderClass);

    var avatar = document.createElement('img');
    avatar.classList.add('avatar');
    if (senderClass === 'user') {
        avatar.src = 'user-avatar.png';
    } else {
        avatar.src = 'aww_emoji.png';
    }

    var messageText = document.createElement('span');
    // Use innerHTML to allow HTML tags to be rendered
    messageText.innerHTML = message.replace(/\n/g, '<br>');

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageText);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showStartingMessage() {
    const startingMessage = "Hello, I'm Aww, a chatbot to support parents with their adolescents children and their well-being in social media use.";
    displayMessage(startingMessage, 'mbaymax-intro');
}

function askPredefinedQuestion(question) {
    displayMessage(question, 'user');

    let response;
    if (question === 'What is Aww') {
        response = "Aww (Adolescents and Well-being Wikipedia) is a chatbot created by the Stanford Social Media Lab. It aims to support parents with adolescents and their well-being in social media use. For more information, visit our website: <a href='https://sml.stanford.edu/adolescents-and-well-being' target='_blank'>sml.stanford.edu/adolescents-and-well-being</a>. ٩(•̤̀ᵕ•̤́๑)";
    } else if (question === "Aww, that's cute!") {
        response = "Aww, you are cute too! Let me know what I can help. ٩(◕‿◕)۶";
    }

    displayMessage(response, 'mbaymax');
}

function loadTopics() {
    fetch('/topics')
        .then(response => response.json())
        .then(data => {
            const topicButtons = document.getElementById('topic-buttons');
            data.topics.forEach((topic, index) => {
                const button = document.createElement('button');
                button.textContent = topic.name;
                button.style.backgroundColor = getColor(index);
                button.onclick = () => toggleQuestions(topic, index + 1);
                topicButtons.appendChild(button);
            });
        })
        .catch(error => console.error('Error loading topics:', error));
}

function toggleQuestions(topic, index) {
    const questionListContainer = document.getElementById('question-list');
    questionListContainer.innerHTML = ''; // Clear existing questions

    const questionList = document.createElement('div');
    questionList.id = `questions-${topic.name}`;
    questionList.classList.add('question-list');
    questionList.style.position = 'absolute';
    questionList.style.left = '180px'; // Adjust this value if needed
    questionList.style.top = '0'; // Start from the top

    topic.questions.forEach(question => {
        const questionButton = document.createElement('button');
        questionButton.textContent = question.question;
        questionButton.style.backgroundColor = getColor(index - 1);
        questionButton.onclick = () => {
            sendMessage(question.question);
            questionListContainer.innerHTML = ''; // Clear questions
        };
        questionList.appendChild(questionButton);
    });

    questionListContainer.appendChild(questionList);
}

function getColor(index) {
    const colors = ['#FF5733', '#FFBD33', '#DBFF33', '#75FF33', '#33FF57', '#33FFBD', '#33DBFF', '#3375FF', '#5733FF', '#BD33FF', '#FF33DB', '#FF3375', '#FF3360', '#FF3366'];
    return colors[index % colors.length];
}

showStartingMessage();
