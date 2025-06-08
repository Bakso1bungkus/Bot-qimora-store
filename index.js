const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys")
const { Boom } = require("@hapi/boom")
const fs = require("fs")
const config = require("./config.json")
const msg = require("./message")

const { state, saveState } = useSingleFileAuthState('./session.json')

async function connect() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveState)

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return

    const text = m.message.conversation || m.message.extendedTextMessage?.text
    const sender = m.key.remoteJid

    if (text === config.prefix + "menu") {
      await sock.sendMessage(sender, { text: msg.menu }, { quoted: m })
    } else if (text === config.prefix + "ping") {
      await sock.sendMessage(sender, { text: "Bot aktif!" }, { quoted: m })
    } else if (text === config.prefix + "owner") {
      await sock.sendMessage(sender, { text: `Owner: wa.me/${config.owner}` }, { quoted: m })
    }
  })
}

connect()