require('dotenv').config()
const { REST, Routes } = require('discord.js')
const { Client, Collection, Events, GatewayIntentBits }  = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { match_button } = require('./interactions/match_button')


const client = new Client({ intents: [GatewayIntentBits.Guilds]})

client.commands = new Collection()

const commands = []

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)

    if('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
        commands.push(command.data.toJSON());
    }   
}

// c = cliente, dei esse nome para n ficar igual ao de cima
client.once(Events.ClientReady, c => {
    console.log(`FUNCIONANDO! LOGADO COMO ${c.user.tag}`)
})


client.on(Events.InteractionCreate, async interaction => {
	if(interaction.isCommand()) {
		const command = interaction.client.commands.get(interaction.commandName)
		
		await command.execute(interaction)
	}
	if(interaction.isButton()) {
		if(interaction.customId.startsWith('match_button')) {
			match_button(interaction)
		}
	}
})

const rest = new REST().setToken(process.env.DISCORD_TOKEN);


(async () => {
	try {
		console.log(`Comandos rodando ${commands.length} !!.`);
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.login(process.env.DISCORD_TOKEN)