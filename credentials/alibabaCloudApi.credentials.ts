import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AlibabaCloudApi implements ICredentialType {
	name = 'alibabaCloudApi'; // This name must match the credential name used in your node
	displayName = 'Alibaba Cloud API';
	// Define the properties required for authentication.
	// Example properties: apiKey and apiSecret. Adjust as needed.
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			placeholder: 'Enter your API Key',
			description: 'Your Alibaba Cloud API Key',
			required: true,
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Enter your API Secret',
			description: 'Your Alibaba Cloud API Secret',
			required: true,
		},
		// Add other properties if needed, e.g., region
		// {
		// 	displayName: 'Region',
		// 	name: 'region',
		// 	type: 'string',
		// 	default: 'cn-hangzhou', // Example default region
		// 	placeholder: 'e.g., cn-hangzhou',
		// 	description: 'Alibaba Cloud Region',
		// 	required: true,
		// }
	];

	// Optional: Implement a test method to verify the credentials
	// async test(this: IAuthenticateGeneric): Promise<string | undefined> {
	// 	try {
	// 		// Replace with an actual API call to test credentials
	// 		// const apiKey = this.credentials.apiKey as string;
	// 		// const apiSecret = this.credentials.apiSecret as string;
	// 		// await someAlibabaCloudApiCall(apiKey, apiSecret);
	// 		return 'Connection tested successfully!';
	// 	} catch (error) {
	// 		throw new Error(`Connection test failed: ${error.message}`);
	// 	}
	// }
}
