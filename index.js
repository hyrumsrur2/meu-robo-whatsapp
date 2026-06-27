const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Robô Mais Consulta Online 🚀'));
app.listen(port, () => console.log(`Servidor web rodando na porta ${port}`));

const historicoClientes = {};

async function iniciarRobo() {
    const { state, saveCreds } = await useMultiFileAuthState('session_dados');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    qrTimeout: 40000 // Dá mais tempo para o QR Code carregar
}); 

    if (!sock.authState.creds.registered) {
        console.log("\n=== AGUARDANDO GERAÇÃO DO QR CODE NO TERMINAL ===\n");
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log("\n🚀 ROBÔ MAIS CONSULTA ONLINE NA NUVEM! 🚀\n");
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const mensagemRecebida = m.messages[0];
        if (!mensagemRecebida.message) return;

        const texto = (mensagemRecebida.message.conversation || 
                      mensagemRecebida.message.extendedTextMessage?.text || "").trim();
        const numeroCliente = mensagemRecebida.key.remoteJid;
        if (numeroCliente.endsWith('@g.us') || mensagemRecebida.key.fromMe) return;

        console.log(`📩 Mensagem de ${numeroCliente}: "${texto}"`);
        const jaTemHistorico = historicoClientes[numeroCliente];

        if (!jaTemHistorico) {
            historicoClientes[numeroCliente] = { etapa: 'menu_principal' };
            
            const menu = `*Atendimento + Consulta Telemedicina*\n` +
                         `É um prazer tê-lo aqui 😀\n\n` +
                         `Conheça nossos Planos:\n\n` +
                         `*1️⃣Plano Individual*\n` +
                         `*2️⃣Plano Individual+TelePet*\n` +
                         `*3️⃣Plano Familiar*\n` +
                         `*4️⃣Plano Familiar+ TelePet*\n` +
                         `5️⃣ _*O que posso lhe ajudar?*_`;
                         
            await sock.sendMessage(numeroCliente, { text: menu });
        } else {
            const etapaAtual = historicoClientes[numeroCliente].etapa;
            
            if (etapaAtual === 'menu_principal') {
                if (texto === '1' || texto === '2' || texto === '3' || texto === '4') {
                    await sock.sendMessage(numeroCliente, { 
                        text: `Excelente escolha! 🩺✨\n\n` +
                              `👉 Clique no link abaixo para conhecer todos os detalhes e ativar o seu plano:\n` +
                              `https://maisconsultatelemedicina.com.br/indicar/7A031C30\n\n` +
                              `Se precisar de ajuda para finalizar, basta nos chamar por aqui!`
                    });
                    delete historicoClientes[numeroCliente];
                } 
                else if (texto === '5') {
                    await sock.sendMessage(numeroCliente, { 
                        text: `*Escreva sua Dúvida!* será um prazer lhe ajudar 🙂👍\n\n` +
                              `_Obs: Vc será encaminhado para um atendimento humanizado!_`
                    });
                    delete historicoClientes[numeroCliente];
                } 
                else {
                    await sock.sendMessage(numeroCliente, { 
                        text: "❌ Opção inválida. Por favor, digite apenas um número de *1* a *5*." 
                    });
                }
            }
        }
    });
}

iniciarRobo();
