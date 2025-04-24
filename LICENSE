
#### 4. **credentials/alibabaCloudApi.credentials.ts**

O arquivo `alibabaCloudApi.credentials.ts` define a estrutura das credenciais.

```typescript
import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AlibabaCloudApi implements ICredentialType {
    name = 'alibabaCloudApi';
    displayName = 'Alibaba Cloud API';
    documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/credentials/';
    properties: INodeProperties[] = [
        {
            displayName: 'Access Key ID',
            name: 'accessKeyId',
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName: 'Access Key Secret',
            name: 'accessKeySecret',
            type: 'string',
            default: '',
            required: true,
        },
    ];
}