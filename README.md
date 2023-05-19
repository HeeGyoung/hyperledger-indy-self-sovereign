### 1. Build local von-network
This process comes from
https://github.com/bcgov/von-network/blob/main/docs/UsingVONNetwork.md
```
git clone https://github.com/bcgov/von-network
cd von-network
./manage build
./manage start --logs
```
You can check your ledger through local webserver: http://0.0.0.0:9000

### 2. Create DID
> You can see more details in /von-network/docs/Indy-CLI.md file.
> Execute below commands under the von-network folder.

1. Generate secrets 
```
./manage generateSecrets
```
The result:
```
Seed: WqLmDo/f2+MUamWoUXYLReswFBe8oPe6
Key: 4Tu6HXk4iAKRsaC0FWOMUaGolgQo7iuoQkH4oGHDWxyYNp3PSFcYKzjBTpt/K7YL
```
The ```Seed``` is going to be ```publicDidSeed```.
Please change `publicDidSeed` in /IssuerAgent/connection/initialization.ts
2. create DID using the seed we created upper.
```
./manage generateDid WqLmDo/f2+MUamWoUXYLReswFBe8oPe6
```
The result:
```
Seed: WqLmDo/f2+MUamWoUXYLReswFBe8oPe6
DID: PQ5gcrPJcmsRwcHugrf5pV
Verkey: DD3WByseZgGsNuXdFs2T5mDsLhsYLaUNV9sm5wQBeHur
```
3. Register your DID
   1. Browse to http://localhost:9000/.
   2. In the Authenticate a New DID section enter the seed (created above) in the Wallet seed (32 characters or base64) field and my-did in the Alias (optional) field.
   3. Click Register DID

### 3. Create wallet
```
./manage indy-cli create-wallet walletName=issuer_wallet
```
Enter your key: `wallet_key_length_has_to_be_32__`  
Enter your Seed: `WqLmDo/f2+MUamWoUXYLReswFBe8oPe6`
The result:
```
Did "PQ5gcrPJcmsRwcHugrf5pV" has been created with "~4i4W8YDQFc73Qb34RVo7Xn" verkey

did list
+------------------------+-------------------------+----------+
| Did                    | Verkey                  | Metadata |
+------------------------+-------------------------+----------+
| PQ5gcrPJcmsRwcHugrf5pV | ~4i4W8YDQFc73Qb34RVo7Xn | -        |
+------------------------+-------------------------+----------+

wallet close
Wallet "issuer_wallet" has been closed

exit
```
Wallet DID is going to be your `walletConfig.id`.  
The key `wallet_key_length_has_to_be_32__` is going to be your `walletConfig.key`.  
Please change `walletConfig` in /IssuerAgent/connection/initialization.ts

### 4. Build IssuerAgent
```
cd IssuerAgent
docker-compose up -d
npm install
npm build
npm run dev
```
Swagger UI: http://0.0.0.0:8888/api/docs

### 5. Build EndUserAgent
```
cd EndUserAgent
npm install
npm build
npm run dev
```
Swagger UI: http://0.0.0.0:9999/api/docs

### how to issue a credential
> If you see PoolLedgerTimeout, add `127.0.0.1 host.docker.internal` into the host file.

Using swagger UI...
1. Create credential: `POST /create/credential`
```
{
  "credentialId": "PQ5gcrPJcmsRwcHugrf5pV:3:CL:7:default",
  "credentialName": "driver_licence",
  "version": "1.0",
  "schemaId": "PQ5gcrPJcmsRwcHugrf5pV:2:driver_licence:1.0",
  "attributes": [
    "name",
    "issuedNumber",
    "type"
  ],
  "_id": "6466785ecef93846a6f71165",
  "__v": 0
}
```
2. Send credential to enduser: `POST /send/credential`  
You can see EndUserAgent web logs..
```
[1] Credential for credential id a517a5b6-9c41-4c01-beb6-fc6386b030de is accepted
[1] Credential is...
[1] [
[1]   CredentialPreviewAttribute {
[1]     mimeType: 'text/plain',
[1]     name: 'name',
[1]     value: 'Alice'
[1]   },
[1]   CredentialPreviewAttribute {
[1]     mimeType: 'text/plain',
[1]     name: 'issuedNumber',
[1]     value: 'IssuedNumber123456789'
[1]   },
[1]   CredentialPreviewAttribute {
[1]     mimeType: 'text/plain',
[1]     name: 'type',
[1]     value: 'G1'
[1]   }
[1] ]
```


### how to build local aries cloudagent
If you want more APIs we could use with Aries, please check Aries cloud-agent.
```
cd aries-cloudagent
docker-compose up
```
Swagger UI: http://0.0.0.0:8030/api/doc

> This is for the local test/study. In real, Wallet key and your secrets has not to be revealed.
> .env file also has to be included in .gitignore, but for the test, .env file is included for this project.