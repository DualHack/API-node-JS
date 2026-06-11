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
    "riskLevel": "LOW"
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
    "riskLevel": "MEDIUM"
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
      "riskLevel": "HIGH"
    },
    {
      "phone": "+244923456789",
      "reports": 12,
      "riskLevel": "HIGH"
    }
  ]
}
```

### `GET /api/sync/phones`

Retorna uma lista leve de telefones para sincronização offline.

Uso previsto:

- o app mobile chama esta rota regularmente quando há conexão
- recebe a base de números perigosos atualizada
- armazena localmente para consulta rápida sem estar online
- usa `phone`, `reports` e `riskLevel` na lógica de bloqueio/alerta no app

Essa rota cria um payload enxuto com:

- `phone`
- `reports`
- `riskLevel`

Resposta de sucesso (`200`):

```json
{
  "success": true,
  "data": [
    {
      "phone": "+244912345678",
      "reports": 25,
      "riskLevel": "HIGH"
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
