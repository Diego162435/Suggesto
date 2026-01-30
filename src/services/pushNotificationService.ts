export const initOneSignal = () => {
    const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

    if (typeof window !== 'undefined') {
        const win = window as any;
        win.OneSignalDeferred = win.OneSignalDeferred || [];
        win.OneSignalDeferred.push(async (OneSignal: any) => {
            // Previne erro de inicialização dupla se o SDK já estiver rodando
            if (OneSignal.initialized) {
                console.log("OneSignal já inicializado.");
                return;
            }

            await OneSignal.init({
                appId: ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true,
                promptOptions: {
                    slidedown: {
                        enabled: true,
                        autoPrompt: true,
                        timeDelay: 20,
                        pageViews: 3
                    }
                },
                notifyButton: {
                    enable: true,
                    position: 'bottom-left',
                    size: 'medium',
                    theme: 'default',
                    text: {
                        'tip.state.unsubscribed': 'Inscrever-se nas notificações',
                        'tip.state.subscribed': 'Você está inscrito!',
                        'tip.state.blocked': 'Você bloqueou as notificações',
                        'message.prenotify': 'Gostaria de receber notificações?',
                        'message.action.subscribing': 'Inscrevendo...',
                        'message.action.subscribed': 'Inscrito!',
                        'message.action.resubscribed': 'Inscrito!',
                        'message.action.unsubscribed': 'Desinscrito!',
                        'dialog.main.title': 'Gerenciar Notificações',
                        'dialog.main.button.subscribe': 'INSCREVER',
                        'dialog.main.button.unsubscribe': 'DESINSCREVER'
                    }
                },
                welcomeNotification: {
                    enable: true,
                    title: "Suggesto",
                    message: "Obrigado por ativar as notificações!"
                }
            });
        });
    }
};
