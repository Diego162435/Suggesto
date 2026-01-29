# Guia de Configuração de Notificações Push (OneSignal)

Para integrar notificações push no seu projeto, siga estes passos. O OneSignal é excelente para apps web e híbridos porque lida com a complexidade das diferenças entre navegadores e plataformas móveis.

## 1. Configuração da Conta OneSignal
1. Crie uma conta gratuita em [onesignal.com](https://onesignal.com).
2. Crie um "New App/Website".
3. Selecione **"Web"** para notificações no navegador OU **"Google Android / Apple iOS"** se estiver usando um wrapper nativo.
4. Para Web: Configure seu domínio (durante o desenvolvimento, você pode usar `localhost:5173`).
5. Copie o seu **App ID** na seção "Keys & IDs".

## 2. Integração Técnica (Passos que eu vou realizar)

### A. Adicionar o SDK
Vou adicionar o SDK do OneSignal ao `index.html`:
```html
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
```

### B. Lógica de Inicialização
Vou criar um serviço/hook para inicializar o SDK com o seu App ID:
```typescript
// src/services/pushNotifications.ts
import OneSignal from 'react-onesignal';

export async function initPush() {
  await OneSignal.init({ 
    appId: "SEU_ONESIGNAL_APP_ID",
    allowLocalhostAsSecureOrigin: true 
  });
}
```

### C. Service Worker
O OneSignal exige um arquivo chamado `OneSignalSDKWorker.js` na pasta `public`. Eu vou te orientar como baixar ou criar este arquivo.

## 3. Próximas Ações
- [ ] Me forneça o seu **App ID** do OneSignal.
- [ ] Eu vou implementar o componente `PushNotificationManager` para pedir permissão ao usuário.
- [ ] Vou atualizar o `App.tsx` para incluir a lógica de inicialização.

> [!IMPORTANT]
> Notificações Push exigem um contexto seguro (HTTPS) ou `localhost` para funcionar nos navegadores.
