const { ActivityHandler, MessageFactory } = require('botbuilder');

class MainDialog extends ActivityHandler {
    constructor() {
        super();
        this.products = [
            { name: 'Hamburguesa', price: 22900 },
            { name: 'Pizza completa', price: 18000 },
            { name: 'Papas Fritas', price: 5500 },
            { name: 'Gaseosa', price: 6500 }
        ];

        this.userState = {};

        // Evento cuando el usuario envía un mensaje
        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text.toLowerCase();

            if (!this.userState[context.activity.from.id]) {
                await context.sendActivity(`¡Hola! Soy PideYA, tu asesor virtual. Estos son nuestros productos:`);
                this.userState[context.activity.from.id] = { stage: 'selectProduct', order: [], total: 0 };
                await this.listProducts(context);
            } else {
                await this.handleUserResponse(context, userMessage);
            }

            await next();
        });

        // Evento cuando se agrega el bot a una conversación
        this.onMembersAdded(async (context, next) => {
            const welcomeText = '¡Bienvenido al restaurante de comidas rápidas! Soy PideYA y estoy aquí para ayudarte con tu pedido.';
            await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            await next();
        });
    }

    async listProducts(context) {
        let productList = this.products.map((p, index) => `${index + 1}. ${p.name} - $${p.price}`).join('\n');
        await context.sendActivity(`Nuestros productos son:\n${productList}\n\nPor favor, escribe el número del producto que deseas.`);
    }

    async handleUserResponse(context, userMessage) {
        const userState = this.userState[context.activity.from.id];

        if (userState.stage === 'selectProduct') {
            const productIndex = parseInt(userMessage) - 1;
            if (productIndex >= 0 && productIndex < this.products.length) {
                const selectedProduct = this.products[productIndex];
                userState.order.push(selectedProduct);
                userState.total += selectedProduct.price;

                await context.sendActivity(`Has seleccionado ${selectedProduct.name}. ¿Te gustaría agregar otro producto? (sí/no)`);
                userState.stage = 'confirmMoreProducts';
            } else {
                await context.sendActivity(`Por favor, selecciona un número válido.`);
                await this.listProducts(context);
            }
        } else if (userState.stage === 'confirmMoreProducts') {
            if (userMessage === 'sí' || userMessage === 'si') {
                await this.listProducts(context);
                userState.stage = 'selectProduct';
            } else if (userMessage === 'no') {
                await context.sendActivity('Por favor, proporciona los siguientes datos:');
                await context.sendActivity('1. Nombre\n2. Lugar de envío\n3. Número de celular\n4. Forma de pago');
                userState.stage = 'collectUserData';
            } else {
                await context.sendActivity(`Por favor responde con "sí" o "no".`);
            }
        } else if (userState.stage === 'collectUserData') {
            const [name, location, phone, payment] = userMessage.split('\n');
            userState.userData = { name, location, phone, payment };

            await context.sendActivity(`Confirma tu pedido:\nNombre: ${name}\nLugar de envío: ${location}\nTeléfono: ${phone}\nForma de pago: ${payment}\nTotal: $${userState.total}`);
            userState.stage = 'confirmOrder';
        } else if (userState.stage === 'confirmOrder') {
            if (userMessage === 'confirmar') {
                await context.sendActivity('¡Gracias por tu pedido! Hemos notificado al restaurante para que inicie la preparación. ¡Que lo disfrutes!');
                delete this.userState[context.activity.from.id];
            } else {
                await context.sendActivity('Por favor, responde con "confirmar" para completar tu pedido.');
            }
        }
    }
}

module.exports.MainDialog = MainDialog;