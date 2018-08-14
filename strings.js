'use strict';
const languageStrings = {
    'en-GB': {
        'translation': {
            'WELCOME_MESSAGE' : 'Welcome to Read Notice Skill. Login with your name to start',
            'REP_WELCOME':'Login with your name to start',
            'LEAVE_MESSAGE':'Goodbye. See you soon',
            'LEAVE_MESSAGE_2':'An error occurred that caused the session to end. See you soon',
            'STOP_MESSAGE':'Okay, what do you want to do now?',
            'REP_STOP':'Are you there? What we do now?',
            'REGISTER_SUC_MESSAGE':'Great! Could be successfully registered with the username {{slotValue}}',
            'REGISTER_REJ_MESSAGE':'Sorry, the user already exists. It is not possible to register with the username {{slotValue}}. Register with a new name',
            'REP_REGISTER_REJ_MESSAGE': 'Please, register with a new name',
            'LOGIN_SUC_MESSAGE':'Hello {{slotValue}}! Now, you can get your content.',
            'REP_LOGIN_SUC_MESSAGE':'If you want to listen the content just say it',
            'LOGIN_REJ_MESSAGE':'Sorry, there is no registered user with the name {{slotValue}}. Log in with a valid username.',
            'REP_LOGIN_REJ_MESSAGE':'Please, log in with a valid username',
            'LOGIN_REJ2_MESSAGE':'Sorry, you can not login because the user {{slotValue}} is already active in the system.',
            'REP_LOGIN_REJ2_MESSAGE':'Please, go back later',
            'LOGOUT_SUC_MESSAGE':'Goodbye {{slotValue}}. See you later!',
            'LOGOUT_REJ_MESSAGE':'Sorry, you can not close the session. Please enter a correct username. The active user in the system is {{slotValue}} .Please, enter a correct username',
            'REP_LOGOUT_REJ_MESSAGE':'Please, enter a correct username',
            'LOGOUT_REJ2_MESSAGE':'Sorry, you must first login before you can logout',
            'CONTENT_REJ_MESSAGE':'Sorry, first you must login to be able to get news',
            'REP_CONTENT_REJ_MESSAGE':'Please login before you can obtain the content',
            'CONTENT_REJ2_MESSAGE':'Sorry, I didn\'t get that',
            'REP_CONTENT_REJ2_MESSAGE':'Please enter a valid intent request',
            'LIST_OF_TITLES':'Say ok to confirm and say continue to pass to the next title. The titles are: {{title}}',
            'LIST_OF_CATEGORIES':'Say ok to confirm and say next to pass to the next category. The categories are: {{category}}',
            'OBTAIN_SLOT':'Which is your username?',
            'REP_OBTAIN_SLOT':'Please say your username',
            'LAST_CONTENT':'This is the last content for the category.',
            'LAST_CONTENT_END':'Say next to return to the list of categories',
            'START_POINT':'There are no more categories. Say return my categories to return to the list or sign off before to quit'
        }
    },
    'en-US': {
        'translation': {
            'WELCOME_MESSAGE' : 'Welcome to Read Notice Skill. Login with your name to start',
            'REP_WELCOME':'Login with your name to start',
            'LEAVE_MESSAGE':'Goodbye. See you soon',
            'LEAVE_MESSAGE_2':'An error occurred that caused the session to end. See you soon',            
            'STOP_MESSAGE':'Okay, what do you want to do now?',
            'REP_STOP':'Are you there? What we do now?',
            'REGISTER_SUC_MESSAGE':'Great! Could be successfully registered with the username {{slotValue}}',
            'REGISTER_REJ_MESSAGE':'Sorry, the user already exists. It is not possible to register with the username {{slotValue}}. Register with a new name',
            'REP_REGISTER_REJ_MESSAGE': 'Please, register with a new name',
            'LOGIN_SUC_MESSAGE':'Hello {{slotValue}}! Now, you can get your content.',
            'REP_LOGIN_SUC_MESSAGE':'If you want to listen the content just say it',
            'LOGIN_REJ_MESSAGE':'Sorry, there is no registered user with the name {{slotValue}}. Log in with a valid username.',
            'REP_LOGIN_REJ_MESSAGE':'Please, log in with a valid username',
            'LOGIN_REJ2_MESSAGE':'Sorry, you can not login because the user {{slotValue}} is already active in the system.',
            'REP_LOGIN_REJ2_MESSAGE':'Please, go back later',
            'LOGOUT_SUC_MESSAGE':'Goodbye {{slotValue}}. See you later!',
            'LOGOUT_REJ_MESSAGE':'Sorry, you can not close the session. Please enter a correct username. The active user in the system is {{slotValue}} .Please, enter a correct username',
            'REP_LOGOUT_REJ_MESSAGE':'Please, enter a correct username',
            'LOGOUT_REJ2_MESSAGE':'Sorry, you must first login before you can logout',
            'CONTENT_REJ_MESSAGE':'Sorry, first you must login to be able to get news',
            'REP_CONTENT_REJ_MESSAGE':'Please login before you can obtain the content',
            'CONTENT_REJ2_MESSAGE':'Sorry, I didn\'t get that',
            'REP_CONTENT_REJ2_MESSAGE':'Please enter a valid intent request',        
            'LIST_OF_TITLES':'Say ok to confirm and say continue to pass to the next title. The titles are: {{title}}',        
            'LIST_OF_CATEGORIES':'Say ok to confirm and say next to pass to the next category. The categories are: {{category}}',
            'OBTAIN_SLOT':'Which is your username?',
            'REP_OBTAIN_SLOT':'Please say your username',
            'LAST_CONTENT':'This is the last content for the category.',
            'LAST_CONTENT_END':'Say next to return to the list of categories',
            'START_POINT':'There are no more categories. Say return my categories to return to the list or sign off before to quit'
        }
    },
    'es-ES': {
        'translation': {
            'WELCOME_MESSAGE' : 'Bienvenido al skill Lector de contenidos. Ingresa con tu nombre para empezar',
            'REP_WELCOME':'Ingresa con tu nombre para empezar',
            'LEAVE_MESSAGE':'Adios. Nos vemos pronto',
            'LEAVE_MESSAGE_2':'Se cerro la sesion debido a un error producido. Nos vemos pronto',
            'STOP_MESSAGE':'Que quieres hacer ahora?',
            'REP_STOP':'Estas ahi? Que hacemos ahora?',
            'REGISTER_SUC_MESSAGE':'Genial! Te pudiste registrar con el nombre {{slotValue}}',
            'REGISTER_REJ_MESSAGE':'Lo siento, el usuario ya existe. No es posible registrarte con el nombre {{slotValue}}. Registrate con un nuevo nombre',
            'REP_REGISTER_REJ_MESSAGE': 'Por favor, registrate con un nuevo nombre',
            'LOGIN_SUC_MESSAGE':'Hola {{slotValue}}! Ahora puedes escuchar tus contenidos',
            'REP_LOGIN_SUC_MESSAGE':'Si quieres escuchar tus contenidos solo dilo',
            'LOGIN_REJ_MESSAGE':'Lo siento, no existe ningun usuario registrado con el nombre {{slotValue}}. Ingresa con un nombre de usuario valido',
            'REP_LOGIN_REJ_MESSAGE':'Por favor, ingresa con un nombre de usuario valido',
            'LOGIN_REJ2_MESSAGE':'Lo siento, no puedes ingresar porque el usuario {{slotValue}} ya se encuentra activo',
            'REP_LOGIN_REJ2_MESSAGE':'Por favor, vuelve mas tarde',
            'LOGOUT_SUC_MESSAGE':'Aios {{slotValue}}. Nos vemos mas tarde!',
            'LOGOUT_REJ_MESSAGE':'Lo siento, no es posible cerrar la sesion. Ingresa un nomvbre de usuario correcto. El usuario activo en el sistema es {{slotValue}}',
            'REP_LOGOUT_REJ_MESSAGE':'Por favor, ingresa con un nombre de usuario correcto',
            'LOGOUT_REJ2_MESSAGE':'Lo siento, debes ingresar primero al sistema antes de poder salir',
            'CONTENT_REJ_MESSAGE':'Lo siento, debes ingresar primero para poder obtener tus contenidos',
            'REP_CONTENT_REJ_MESSAGE':'Por favor ingresa antes de poder obtener tus contenidos',
            'CONTENT_REJ2_MESSAGE':'Lo siento, no conozco ese mensaje',
            'REP_CONTENT_REJ2_MESSAGE':'Por favor ingresa un requerimiento correcto',
            'LIST_OF_TITLES':'Indica ok para confirmar y continuar para avanzar al siguiente titulo. Los titulos son: {{title}}',
            'LIST_OF_CATEGORIES':'Indica ok para confirmar y siguiente para avanzar a la siguiente categoria. Las categorias son: {{category}}',
            'OBTAIN_SLOT':'Cual es tu usuario?',
            'REP_OBTAIN_SLOT':'Por favor di tu nombre de usuario',
            'LAST_CONTENT':'Este es el ultimo contenido de la categoria.',        
            'LAST_CONTENT_END':'Di siguiente para volver a la lista de categorias',
            'START_POINT':'No quedan mas categorias. Di retornar mis categorias para volver a la lista o cierra sesion antes de salir'
        }
    }
};

module.exports = languageStrings