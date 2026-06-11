# AngoSec Backend

Backend base para o hackathon AngoSec, uma API REST em Node.js + Express + MongoDB para denunciar e consultar números suspeitos.

## Estrutura do Projeto

- `src/models` - modelos Mongoose
- `src/controllers` - controladores REST
- `src/services` - lógica de negócio
- `src/routes` - rotas da API
- `src/config` - configuração do banco de dados
- `src/app.js` - configuração do Express
- `src/server.js` - inicialização do servidor

## Instalação

1. Abra a pasta `API-node-JS`
2. Rode `npm install`
3. Configure o MongoDB em `.env`
4. Rode `npm run dev` para desenvolvimento

## Variáveis de ambiente

Crie um arquivo `.env` com:

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/angosec
```

## API Endpoints

Todas as rotas retornam JSON e usam `Content-Type: application/json`.

### `GET /api`

Retorna a raiz da API com as rotas disponíveis.

Resposta de sucesso:

```json
{
  "success": true,
  "message": "AngoSec API root",
  "routes": [
    "GET /api/health",
    "POST /api/reports",
    "GET /api/phones/:phone",
    "GET /api/phones/top/reported",
    "GET /api/sync/phones",
    "POST /api/sms/report",
    "POST /api/ussd",
    "GET /api/analytics/summary"
  ]
}
```

### `GET /api/health`

Verifica se a API está disponível.

Resposta de sucesso:

```json
{
  "success": true,
  "message": "AngoSec API is running"
}
```

### `POST /api/reports`

Cria uma nova denúncia e atualiza o contador do número.

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "phone": "+244912345678",
  "reason": "Chamadas de fraude",
  "description": "Recebi mensagem pedindo dados pessoais.",
  "source": "SMS"
}
```

Campos obrigatórios:

- `phone` (string)
- `reason` (string)
- `source` (string, valores válidos: `APP`, `SMS`, `USSD`)

Campos opcionais:

- `description` (string)

Resposta de sucesso (`201`):

```json
{
  "success": true,
  "data": {
    "reportId": "642d12f4a7d7b88f0c0e6a7d",
    "phone": "+244912345678",
    "reports": 1,
    "riskLevel": "LOW",
    "riskScore": 18,
    "aiInsight": "Número com perfil de risco baixo, monitorizado pelo sistema."
  }
}
```

Resposta de erro (`400`):

```json
{
  "success": false,
  "message": "phone, reason and source are required"
}
```

Resposta de erro de servidor (`500`):

```json
{
  "success": false,
  "message": "An error occurred while creating the report",
  "error": "..."
}
```

### `GET /api/phones/:phone`

Retorna informações resumidas de um número.

Parâmetros de rota:

- `phone` (string) - número de telefone a ser consultado

Exemplo:

`GET /api/phones/+244912345678`

Resposta de sucesso (`200`):

```json
{
  "success": true,
  "data": {
    "phone": "+244912345678",
    "reports": 5,
    "riskLevel": "MEDIUM",
    "riskScore": 42,
    "lastReportedAt": "2026-06-11T10:15:30.000Z",
    "trend": "INCREASING",
    "aiInsight": "Este número apresenta padrão suspeito devido ao aumento rápido de denúncias em curto período."
  }
}
```

Resposta de erro (`404`):

```json
{
  "success": false,
  "message": "Phone number not found"
}
```

Resposta de erro de servidor (`500`):

```json
{
  "success": false,
  "message": "An error occurred while retrieving phone information",
  "error": "..."
}
```

### `GET /api/phones/top/reported`

Retorna os números mais denunciados, ordenados por `reports` descendentemente.

Resposta de sucesso (`200`):

```json
{
  "success": true,
  "data": [
    {
      "phone": "+244912345678",
      "reports": 25,
      "riskLevel": "HIGH",
      "riskScore": 82,
      "trend": "INCREASING",
      "lastReportedAt": "2026-06-11T10:15:30.000Z",
      "aiInsight": "Detectado comportamento típico de fraude em massa com alta intensidade de denúncias."
    },
    {
      "phone": "+244923456789",
      "reports": 12,
      "riskLevel": "HIGH",
      "riskScore": 68,
      "trend": "STABLE",
      "lastReportedAt": "2026-06-10T14:22:10.000Z",
      "aiInsight": "Número com atividade inconsistente e elevada taxa de denúncias."
    }
  ]
}
```

### `GET /api/sync/phones`

Retorna uma lista leve de telefones para sincronização offline. Esta rota envia apenas números de risco elevado para o app mobile e inclui dados de risco e explicações.

Uso previsto:

- o app mobile chama esta rota regularmente quando há conexão
- recebe a base de números perigosos atualizada
- armazena localmente para consulta rápida sem estar online
- usa `phone`, `reports`, `riskLevel`, `riskScore` e `aiInsight` na lógica de bloqueio/alerta

Resposta de sucesso (`200`):

```json
{
  "success": true,
  "data": [
    {
      "phone": "+244912345678",
      "reports": 25,
      "riskLevel": "HIGH",
      "riskScore": 82,
      "trend": "INCREASING",
      "lastReportedAt": "2026-06-11T10:15:30.000Z",
      "aiInsight": "Detectado comportamento típico de fraude em massa com alta intensidade de denúncias."
    }
  ]
}
```

Resposta de erro de servidor (`500`):

```json
{
  "success": false,
  "message": "An error occurred while preparing sync data",
  "error": "..."
}
```

### `POST /api/sms/report`

Simula um SMS que denuncia um número. Se a mensagem contiver `DENUNCIAR <número>`, gera automaticamente a denúncia.

Body:

```json
{
  "phone": "+244912345678",
  "message": "DENUNCIAR +244912345678"
}
```

Resposta de sucesso (`201`):

```json
{
  "success": true,
  "data": {
    "reportId": "642d12f4a7d7b88f0c0e6a7d",
    "phone": "+244912345678",
    "reports": 15,
    "riskLevel": "HIGH",
    "aiInsight": "Detectado comportamento típico de fraude em massa com alta intensidade de denúncias."
  }
}
```

### `POST /api/ussd`

Simula um serviço USSD para verificar números ou denunciar diretamente.

Body:

```json
{
  "input": "DENUNCIAR +244912345678"
}
```

Comandos suportados:

- `VERIFICAR <número>` - retorna o nível de risco do número
- `DENUNCIAR <número>` - cria uma nova denúncia
- qualquer outro texto retorna o menu básico

Resposta de exemplo:

```json
{
  "success": true,
  "message": "Este número é HIGH e detectado comportamento típico de fraude em massa com alta intensidade de denúncias.",
  "data": {
    "phone": "+244912345678",
    "reports": 15,
    "riskLevel": "HIGH",
    "aiInsight": "Detectado comportamento típico de fraude em massa com alta intensidade de denúncias."
  }
}
```

### `GET /api/analytics/summary`

Retorna um resumo de métricas de fraude e tendências do sistema.

Resposta de sucesso (`200`):

```json
{
  "success": true,
  "data": {
    "totalPhones": 120,
    "totalReports": 489,
    "criticalPhones": 8,
    "fraudTrends": [
      { "trend": "INCREASING", "count": 14 },
      { "trend": "STABLE", "count": 92 },
      { "trend": "DECREASING", "count": 14 }
    ]
  }
}
```

## Modelos de dados

### Phone

- `phone` (string, único)
- `reports` (number)
- `riskLevel` (LOW, MEDIUM, HIGH, CRITICAL)
- `createdAt`
- `updatedAt`

### Report

- `phone` (string)
- `reason` (string)
- `description` (string)
- `source` (APP, SMS, USSD)
- `createdAt`

## Regras de negócio

- Ao criar uma denúncia:
  - incrementa `reports`
  - cria o número automaticamente se não existir
  - atualiza `riskLevel` com base em `reports`

### Níveis de risco

- `1-2 reports` = `LOW`
- `3-9 reports` = `MEDIUM`
- `10-29 reports` = `HIGH`
- `30+ reports` = `CRITICAL`

## Observações

- Sem autenticação
- Sem SOC implementado
- API modular e preparada para integração futura com SOC

## Exemplos de uso com curl

```bash
curl -X POST http://localhost:4000/api/reports \
  -H "Content-Type: application/json" \
  -d '{"phone":"+244912345678","reason":"Fraude de SMS","description":"Mensagem para confirmar dados.","source":"SMS"}'
```

```bash
curl http://localhost:4000/api/phones/%2B244912345678
```

```bash
curl http://localhost:4000/api/phones/top/reported
```

```bash
curl http://localhost:4000/api/sync/phones
```
