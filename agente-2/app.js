const express = require('express');
const app = express();
app.use(express.json());


async function askAgent2() {
    try {
        // Usa o nome do serviço definido no compose como hostname
        const response = await fetch('http://ai-agent-2:3000/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: "Analise estes dados de segurança" })
        });
        const data = await response.json();
        console.log("Resposta da IA-2:", data);
    } catch (error) {
        console.error("Falha ao contatar a IA-2:", error.message);
    }
}

app.listen(3000, () => {
    console.log('AI-Agent-1 rodando isoladamente.');
    // Simula uma requisição para a outra IA após iniciar
    setTimeout(askAgent2, 2000); 
});