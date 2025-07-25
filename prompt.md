Integração Mercado Pago – Lista de Tarefas de Ajuste (Checkout Transparente)
	•	Atualizar credenciais de teste: Inserir as novas credenciais de teste do Mercado Pago no projeto:
	•	Public Key (chave pública): TEST-78dd54f8-b60d-40f8-b339-24f92a8082b7
	•	Access Token (token de acesso): TEST-455837457520173-071509-34ac9181ded8c8ba2458d3c1732174ac-2557444097
	•	Dica: Armazene a chave pública no front-end (por exemplo, em um arquivo .env com prefixo apropriado se usar Vite/React) e o access token no back-end (variável de ambiente no servidor), garantindo que o token não seja exposto publicamente.
	•	Importar SDK JavaScript do Mercado Pago no front-end: Adicionar o script do MercadoPago.js (SDK do Checkout Transparente) no HTML principal da aplicação (por exemplo, no <body> do arquivo index.html):

<script src="https://sdk.mercadopago.com/js/v2"></script>

	•	Isso garante que a biblioteca Mercado Pago esteja disponível para uso no browser.

	•	Instanciar objeto MercadoPago no front-end: Após importar o script, inicializar o objeto MercadoPago utilizando a Public Key de teste:

const mp = new MercadoPago("TEST-78dd54f8-b60d-40f8-b339-24f92a8082b7");

	•	Esse objeto mp será usado para criar formulários de cartão, obter tokens e tipos de documento, etc.

	•	Criar formulário de pagamento para Cartão de Crédito/Débito: No front-end, incluir um formulário HTML para capturar os dados do cartão do cliente. Por exemplo:

<form id="form-checkout">
  <div id="form-checkout__cardNumber" class="container"></div>
  <div id="form-checkout__expirationDate" class="container"></div>
  <div id="form-checkout__securityCode" class="container"></div>
  <input type="text" id="form-checkout__cardholderName" placeholder="Titular do cartão" />
  <select id="form-checkout__issuer"></select>
  <select id="form-checkout__installments"></select>
  <select id="form-checkout__identificationType"></select>
  <input type="text" id="form-checkout__identificationNumber" placeholder="CPF do titular" />
  <input type="email" id="form-checkout__cardholderEmail" placeholder="E-mail" />
  <button type="submit" id="form-checkout__submit">Pagar</button>
  <progress value="0" class="progress-bar">Carregando...</progress>
</form>

	•	Esse formulário contém contêineres (<div> com classe container) onde a biblioteca do Mercado Pago renderizará campos seguros de cartão (cardNumber, expirationDate, securityCode), além de inputs para nome do titular, email, CPF (identificationNumber) e selects para banco emissor (issuer), quantidade de parcelas (installments) e tipo de documento (identificationType).

	•	Inicializar o CardForm do MercadoPago.js: No código JS do front-end, utilize mp.cardForm() para integrar o formulário de cartão com a API do Mercado Pago. Exemplo:

const cardForm = mp.cardForm({
  amount: "100.5",  // valor da transação (pode ser dinâmico)
  iframe: true,
  form: {
    id: "form-checkout",
    cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número do cartão" },
    expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/AA" },
    securityCode: { id: "form-checkout__securityCode", placeholder: "CVV" },
    cardholderName: { id: "form-checkout__cardholderName" },
    issuer: { id: "form-checkout__issuer" },
    installments: { id: "form-checkout__installments" },        
    identificationType: { id: "form-checkout__identificationType" },
    identificationNumber: { id: "form-checkout__identificationNumber" },
    cardholderEmail: { id: "form-checkout__cardholderEmail" }
  },
  callbacks: {
    onFormMounted: error => {
      if (error) console.warn("Erro ao montar formulário: ", error);
    },
    onSubmit: event => {
      event.preventDefault();
      const {
        paymentMethodId: payment_method_id,
        issuerId: issuer_id,
        cardholderEmail: email,
        amount,
        token,
        installments,
        identificationNumber,
        identificationType
      } = cardForm.getCardFormData();
      // Enviar os dados do pagamento de cartão para o backend
      fetch("/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          issuer_id,
          payment_method_id,
          transaction_amount: Number(amount),
          installments: Number(installments),
          description: "Descrição do produto",
          payer: {
            email: email,
            identification: {
              type: identificationType,
              number: identificationNumber
            }
          }
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Resposta do pagamento:", data);
        // TODO: Tratar o resultado do pagamento (exibir confirmação, erros, etc.)
      });
    },
    onFetching: (resource) => {
      // Animação da barra de progresso durante processamento
      const progressBar = document.querySelector(".progress-bar");
      progressBar.removeAttribute("value");
      return () => progressBar.setAttribute("value", "0");
    }
  }
});

	•	Esse código monta o formulário de cartão e, no callback onSubmit, gera um token seguro do cartão (CardToken) e coleta todos os dados necessários para pagamento. Em seguida, envia uma requisição POST para o endpoint /process_payment do backend com os dados do pagamento (token, valor, parcelas, método de pagamento, emissor, e dados do pagador).
	•	Importante: O token do cartão (token) gerado em cardForm.getCardFormData() representa os dados sensíveis do cartão de forma segura. Ele pode ser usado uma única vez para criar um pagamento e expira em 7 dias se não for utilizado. Não armazene esse token; use-o imediatamente na requisição de pagamento.

	•	Preencher tipos de documento automaticamente: Utilize a função do SDK para obter os tipos de documento (ex.: CPF, CNPJ) e preencher o campo select correspondente no formulário:

mp.getIdentificationTypes()
  .then(types => {
    const docTypeSelect = document.getElementById('form-checkout__identificationType');
    types.forEach(type => {
      const opt = document.createElement('option');
      opt.value = type.id;
      opt.textContent = type.name;
      docTypeSelect.appendChild(opt);
    });
  })
  .catch(error => console.error("Erro ao obter tipos de documento: ", error));

	•	Execute essa lógica quando a tela de checkout for carregada, para que o select de documento contenha opções como CPF (para Brasil) automaticamente.

	•	Adicionar formulário para pagamento via Pix: Incluir no front-end um formulário (ou seção) específico para Pix. Este formulário deve coletar os dados mínimos do pagador:

<form id="form-checkout-pix" action="/process_payment" method="POST">
  <input type="text" name="payerFirstName" placeholder="Nome" id="form-checkout__payerFirstName" />
  <input type="text" name="payerLastName" placeholder="Sobrenome" id="form-checkout__payerLastName" />
  <input type="email" name="email" placeholder="E-mail" id="form-checkout__email" />
  <select name="identificationType" id="form-checkout__identificationType_pix"></select>
  <input type="text" name="identificationNumber" placeholder="CPF" id="form-checkout__identificationNumber_pix" />
  <input type="hidden" name="transactionAmount" value="100" />
  <input type="hidden" name="description" value="Nome do Produto" />
  <button type="submit">Pagar com Pix</button>
</form>

	•	Assim como no caso do cartão, utilize mp.getIdentificationTypes() para preencher o select identificationType_pix com opções (CPF, etc.).
	•	Esse formulário deve ser exibido apenas se o usuário escolher Pix como meio de pagamento. Ao submeter, ele enviará nome, sobrenome, e-mail e CPF do pagador, além do valor e descrição do pagamento, para o backend criar a cobrança Pix.

	•	Adicionar formulário para pagamento via Boleto Bancário: Incluir um formulário específico para Boleto no front-end, coletando todas as informações obrigatórias:

<form id="form-checkout-boleto" action="/process_payment" method="POST">
  <h3>Dados do Comprador (Boleto)</h3>
  <input type="text" name="first_name" placeholder="Nome" id="form-checkout__payerFirstName_bol" />
  <input type="text" name="last_name" placeholder="Sobrenome" id="form-checkout__payerLastName_bol" />
  <input type="email" name="email" placeholder="E-mail" id="form-checkout__email_bol" />
  <select name="identificationType" id="form-checkout__identificationType_bol"></select>
  <input type="text" name="identificationNumber" placeholder="CPF" id="form-checkout__identificationNumber_bol" />
  <h3>Endereço para o Boleto</h3>
  <input type="text" name="zip_code" placeholder="CEP" id="form-checkout__zip_code" />
  <input type="text" name="street_name" placeholder="Rua" id="form-checkout__street_name" />
  <input type="text" name="street_number" placeholder="Número" id="form-checkout__street_number" />
  <input type="text" name="neighborhood" placeholder="Bairro" id="form-checkout__neighborhood" />
  <input type="text" name="city" placeholder="Cidade" id="form-checkout__city" />
  <input type="text" name="federal_unit" placeholder="Estado (UF)" id="form-checkout__federal_unit" />
  <input type="hidden" name="transactionAmount" value="100" />
  <input type="hidden" name="description" value="Nome do Produto" />
  <button type="submit">Pagar com Boleto</button>
</form>

	•	Preencher o select identificationType_bol também com os tipos de documento disponíveis (CPF, CNPJ) usando mp.getIdentificationTypes().
	•	Atenção: Campos como CEP, rua, número, bairro, cidade e estado são obrigatórios para pagamento com boleto. Certifique-se de validar esses campos antes de enviar o formulário.

	•	Configurar o backend com o Access Token: No servidor (backend), inicializar a SDK do Mercado Pago ou configurar as credenciais de API usando o Access Token de teste:
	•	Exemplo em Python (SDK MercadoPago):

import mercadopago
mercadopago.sdk.MercadoPagoConfig.set_access_token("TEST-455837457520173-071509-34ac9181ded8c8ba2458d3c1732174ac-2557444097")

(Caso use o client Python PaymentClient:)

from mercadopago import Payment, RequestOptions, MercadoPagoConfig
MercadoPagoConfig.set_access_token("TEST-...<ACCESS_TOKEN>...")
client = Payment.PaymentClient()
request_options = RequestOptions()
request_options.set_custom_headers({"X-Idempotency-Key": "<UUID_V4_UNICO>"})
# ... usar client.create(...) para criar o pagamento conforme exemplos abaixo


	•	Exemplo em Node.js (SDK MercadoPago):

const mercadopago = require('mercadopago');
mercadopago.configure({
  access_token: 'TEST-455837457520173-071509-34ac9181ded8c8ba2458d3c1732174ac-2557444097'
});


	•	Assegure que o Access Token fique seguro (por exemplo, em variável de ambiente) e não acessível no front-end.

	•	Implementar endpoint /process_payment no backend: Desenvolva uma rota/endpoint no servidor para receber as requisições do front-end (pagamentos de cartão, Pix ou boleto). Esse endpoint deve:
	•	Receber os dados do pagamento enviados pelo front-end (JSON ou form).
	•	Identificar o meio de pagamento a ser processado:
	•	Se a requisição contém um campo token (e.g. veio do formulário de cartão via JS), então o pagamento é por Cartão.
	•	Se não houver token e tiver payment_method_id = "pix", então é pagamento via Pix.
	•	Se payment_method_id = "bolbradesco", então é via Boleto.
	•	(Obs: você pode usar diferentes endpoints para cada tipo – ex: /pay_card, /pay_pix, /pay_boleto – mas aqui um único endpoint condicional também pode resolver.)
	•	Montar a estrutura de dados para criar o pagamento via API do Mercado Pago:
	•	Pagamento com Cartão: preparar um objeto com campos:
	•	transaction_amount: valor (número) da transação em Reais.
	•	token: token do cartão recebido do front-end.
	•	description: descrição do produto/serviço.
	•	installments: número de parcelas.
	•	payment_method_id: identificador do método de pagamento (por ex., "visa", "master", etc., retornado pelo cardForm).
	•	issuer_id: identificador do banco emissor (se disponível via cardForm).
	•	payer: objeto com informações do pagador:
	•	email: e-mail do comprador.
	•	identification: sub-objeto com type (tipo de documento, ex: CPF) e number (número do documento).
	•	Pagamento com Pix: preparar objeto com:
	•	transaction_amount: valor da transação.
	•	description: descrição do produto.
	•	payment_method_id: "pix" (indicando Pix).
	•	payer: objeto com ao menos o email do comprador (pode incluir first_name, last_name e identification para complementar informações antifraude).
	•	Pagamento com Boleto: preparar objeto com:
	•	transaction_amount: valor da transação.
	•	description: descrição do produto.
	•	payment_method_id: "bolbradesco" (código do boleto bancário no Mercado Pago ￼).
	•	payer: objeto com dados do comprador:
	•	email: e-mail do comprador.
	•	first_name / last_name: nome e sobrenome.
	•	identification: sub-objeto com type (tipo do doc, ex: CPF) e number (número do doc).
	•	address: sub-objeto com endereço:
	•	zip_code: CEP (formato apenas números, 8 dígitos).
	•	street_name: nome da rua.
	•	street_number: número.
	•	neighborhood: bairro.
	•	city: cidade.
	•	federal_unit: estado (UF, 2 letras).
	•	Enviar a requisição de pagamento à API Mercado Pago: utilizar o SDK ou requisição HTTP:
	•	Inclua no header X-Idempotency-Key um UUID v4 único para cada requisição (para evitar duplicar pagamentos em caso de reenvio).
	•	Via SDK (exemplo Python): payment = client.create(payment_data, request_options) conforme objeto montado acima.
	•	Via HTTP (cURL/fetch): faça POST para https://api.mercadopago.com/v1/payments com Authorization: Bearer {ACCESS_TOKEN} e body em JSON com os campos montados.
	•	Receber a resposta da API Mercado Pago (dados do pagamento) e retornar essa resposta (ou um resumo) para o front-end.
	•	Tratar a resposta da API de pagamento no backend: Após chamar a API do Mercado Pago, analisar o resultado e tomar ações conforme o status:
	•	Para pagamento com Cartão: se a resposta tiver status = "approved", significa que o pagamento foi autorizado/aprovado (em ambiente de teste, usar nome do cartão “APRO” produz esse status). status = "rejected" indica recusado (usar nome “OTHE”, “FUND”, etc, para simular vários motivos). status = "pending" ou "in_process" indica que o pagamento está pendente (por exemplo, aguardando aprovação manual ou análise antifraude).
	•	Para pagamento com Pix: normalmente o pagamento é criado com status: "pending" e status_detail: "pending_waiting_transfer" – aguardando o comprador realizar a transferência Pix. A resposta conterá um objeto point_of_interaction.transaction_data com os dados necessários:
	•	qr_code: código Pix (texto copiável para Pix Copia e Cola).
	•	qr_code_base64: imagem do QR Code em formato Base64.
	•	ticket_url: URL de uma página do Mercado Pago com o QR Code e instruções.
	•	Ação: enviar esses dados (qr_code, qr_code_base64, ticket_url) de volta ao front-end para que sejam apresentados ao usuário (QR Code para escanear e código copiável).
	•	Para pagamento com Boleto: a criação retorna status: "pending" e status_detail: "pending_waiting_payment", indicando que o boleto aguarda pagamento. A resposta incluirá em transaction_details:
	•	external_resource_url: link para visualizar/imprimir o boleto (PDF ou página com código de barras).
	•	expiration_date (ou date_of_expiration): data de vencimento do boleto (por padrão, 3 dias após emissão).
	•	Ação: retornar ao front-end pelo menos a URL do boleto (external_resource_url) para que o usuário possa acessá-lo, e possivelmente a data de vencimento para exibir uma mensagem do prazo.
	•	Exibir resultado do pagamento no front-end: Implementar no front-end a lógica para receber a resposta do /process_payment e informar o usuário:
	•	No caso de Cartão: se aprovado, exibir confirmação de pagamento aprovado (por exemplo, “✅ Pagamento aprovado!”). Se pendente ou em análise, avisar que o pedido está pendente (“⚠️ Pagamento em processamento, aguarde a confirmação.”). Se recusado, mostrar mensagem de erro ao usuário (“❌ Pagamento recusado: {motivo}”). Também pode-se detalhar última parcela ou ID do pagamento, se útil.
	•	No caso de Pix: exibir o QR Code para pagamento e o código copia-e-cola:
	•	Renderizar uma imagem <img> com o src em Data URI (por exemplo: src="data:image/png;base64,{qr_code_base64}") para mostrar o QR Code na tela.
	•	Mostrar também o código qr_code (numerérico) em um campo de texto com opção de copiar, para quem preferir copiar e colar no app bancário.
	•	Incluir um botão/link “Abrir em nova janela” que use o ticket_url para caso o usuário queira ver as instruções completas em outra página.
	•	Informar ao usuário que o pedido ficará pendente até a confirmação do pagamento via Pix (que é instantânea, mas pode ter um prazo de expiração do QR code de 24h por padrão).
	•	No caso de Boleto: mostrar mensagem confirmando a geração do boleto, e disponibilizar o link para visualizá-lo/imprimi-lo:
	•	Por exemplo, um botão “💳 Visualizar Boleto” que abre a URL do external_resource_url em nova aba.
	•	Exibir a data de vencimento do boleto e instruir o usuário a pagá-lo antes desse prazo (por padrão ~3 dias). Informar que o pedido será confirmado assim que o pagamento for compensado (boletos podem levar até 1-2 dias úteis após pagamento para serem confirmados).
	•	Opcionalmente, mostrar o número do boleto ou linha digitável para referência.
	•	(Opcional) Configurar notificações (Webhooks) de pagamento: Para acompanhar automaticamente as mudanças de status (especialmente útil para Pix e Boleto, que não confirmam imediatamente no fluxo do usuário):
	•	Configurar uma URL de notificação/webhook no painel do Mercado Pago ou via API, apontando para uma rota no seu backend (ex: /webhook/mercadopago).
	•	Implementar no backend o processamento dessas notificações: receber os eventos (payments), verificar o topic ou type e o id do recurso, então chamar a API do Mercado Pago (usando o access token) para obter detalhes do pagamento atualizado. Atualizar o status do pedido no seu sistema conforme necessário (por exemplo, marcar pedido como pago quando receber notificação de pagamento aprovado, ou cancelá-lo se boleto expirar).
	•	Garantir respostas HTTP 200 às notificações recebidas para o Mercado Pago não reenviá-las desnecessariamente.
	•	Testar a integração com usuários e cartões de teste: Antes de ir a produção, realizar testes completos usando as credenciais de teste:
	•	Use cartões de teste do Mercado Pago para simular pagamentos por cartão:
	•	Mastercard de teste: 5031 4332 1540 6351, CVV 123, validade 11/30.
	•	Visa de teste: 4235 6477 2802 5682, CVV 123, validade 11/30.
	•	American Express de teste: 3753 651535 56885, CVV 1234, validade 11/30.
	•	Elo Débito de teste: 5067 7667 8388 8311, CVV 123, validade 11/30.
	•	Utilize diferentes nomes de titular para simular resultados:
	•	"APRO" para forçar pagamento aprovado.
	•	"FUND" para simular recusa por fundos insuficientes.
	•	"OTHE" para recusa por erro geral.
	•	"CONT" para pagamento pendente (ex: em revisão).
	•	"SECU" para recusa por código de segurança inválido, etc.
	•	Use um CPF de teste válido, por exemplo 12345678909 (como sugerido na documentação).
	•	Para Pix: teste a criação do QR Code. Ao usar credenciais de teste, você pode gerar o pagamento Pix (status pendente) e verificar se o QR Code e código copiable aparecem corretamente. (No ambiente de teste, não há transferência real, mas você pode marcar manualmente como pago via dashboard do MP sandbox se disponível, ou simplesmente verificar o fluxo até a geração do código).
	•	Para Boleto: gere um boleto de teste e confira se o link do external_resource_url abre a página do boleto com código de barras. No sandbox, os boletos geralmente são marcados como pagos automaticamente após um tempo (ou expiram). Verifique se o sistema está tratando corretamente o caso de boleto pago (talvez simulando via API ou conferindo webhook) e expirado.
	•	Certifique-se de testar fluxos de erro: por exemplo, enviar formulário de cartão com algum dado faltando ou inválido (deve mostrar erro de validação), tentar pagamento com cartão de teste recusado (deve mostrar mensagem de falha), etc., para garantir boa experiência do usuário em todos os casos.
	•	Ir para Produção (Go Live): Após validar que tudo funciona em sandbox:
	•	Substitua as credenciais de teste pelas credenciais de produção (Public Key e Access Token da sua conta Mercado Pago real).
	•	Habilite o protocolo 3DS 2.0 na integração de cartão, se aplicável, para aumentar a segurança e taxa de aprovação (verifique no painel do MP se precisa ativar algo ou se o SDK já suporta automaticamente).
	•	Revise as configurações de conta no Mercado Pago:
	•	Certifique-se que seu usuário vendedor está habilitado para receber pagamentos via todos os meios implementados (cartão, Pix, boleto).
	•	Verifique limites de pagamento, configurações de parcelamento (ex: número máximo de parcelas), etc., conforme necessidade do negócio.
	•	Atenção aos requisitos de produção do Mercado Pago:
	•	Pode ser necessário enviar o formulário Quero Entrar em Produção no dashboard do Mercado Pago, fornecendo documentos ou informações do seu negócio, para habilitar pagamentos reais.
	•	Siga as recomendações para melhorar a aprovação dos pagamentos (por exemplo, enviar o máximo de informações do comprador no pagamento: endereço completo, telefone, e assim por diante, para ajudar na análise antifraude).
	•	Ajuste o X-Idempotency-Key para produção (gerado dinamicamente) e mantenha o processamento de erros/log adequado no backend.
	•	Faça um teste real em produção (com valor baixo ou em ambiente controlado) para verificar se um pagamento real é aprovado e que as notificações estão funcionando.
	•	Documentar e revisar o código: Por fim:
	•	Escreva documentação interna (README ou wiki do projeto) explicando como a integração com Mercado Pago foi feita, onde estão configuradas as chaves (variáveis de ambiente, etc.), e instruções de como testar pagamentos.
	•	Revise o repositório para garantir que nenhuma credencial sensível de produção esteja exposta (as chaves de produção devem ficar somente no ambiente seguro, não hardcoded no código fonte público).
	•	Remova ou invalide as credenciais de teste no código público, se elas tiverem sido commitadas, após concluir os testes (embora sejam de teste, é boa prática).
	•	Verifique se o fluxo de checkout está intuitivo para o usuário final (por exemplo, escolha do meio de pagamento, formulários correspondentes aparecendo corretamente, mensagens claras em caso de erro ou sucesso).
	•	Pronto! Com tudo revisado, sua integração de Checkout Transparente do Mercado Pago com cartão, Pix e boleto estará completa e ajustada. Boa sorte com seu e-commerce!