import {
	type INodeType,
	type INodeTypeDescription,
	type INodeExecutionData,
	type INodeParameters,
	type IExecuteFunctions,
	type INodePropertyOptions,
	type ILoadOptionsFunctions,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import axios, { type AxiosError } from 'axios';

// --- Interfaces ---

interface IQwenResponse {
	output?: {
		text?: string;
		choices?: Array<{ message: { content: string } }>;
	};
	usage?: {
		input_tokens: number;
		output_tokens: number;
		total_tokens: number;
	};
	request_id?: string;
	[key: string]: unknown;
}

// Ensure messages is part of the input definition
interface IQwenRequestBody {
	model: string;
	input: {
		messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>;
	};
	parameters?: {
		temperature?: number;
		top_p?: number;
		max_tokens?: number;
	};
}

// --- Static Data & Types (Outside Class) ---

const modelOptionsDataDefinition = {
	paid: [
		{ name: 'qwen-max', value: 'qwen-max' }, { name: 'qwen-plus', value: 'qwen-plus' },
		{ name: 'qwen-max-latest', value: 'qwen-max-latest' }, { name: 'qwen-plus-latest', value: 'qwen-plus-latest' },
		{ name: 'qwen-max-2025-01-25', value: 'qwen-max-2025-01-25' }, { name: 'qwen-plus-2025-01-25', value: 'qwen-plus-2025-01-25' },
		{ name: 'qwen-turbo-latest', value: 'qwen-turbo-latest' }, { name: 'qwen-turbo', value: 'qwen-turbo' },
		{ name: 'qwen-turbo-2024-11-01', value: 'qwen-turbo-2024-11-01' },
	],
	freeTrial: [
		{ name: 'qwen2.5-14b-instruct-1m', value: 'qwen2.5-14b-instruct-1m' }, { name: 'qwen2.5-72b-instruct', value: 'qwen2.5-72b-instruct' },
		{ name: 'qwen2.5-32b-instruct', value: 'qwen2.5-32b-instruct' }, { name: 'qwen2.5-14b-instruct', value: 'qwen2.5-14b-instruct' },
		{ name: 'qwen2.5-7b-instruct', value: 'qwen2.5-7b-instruct' }, { name: 'qwen2.5-7b-instruct-1m', value: 'qwen2.5-7b-instruct-1m' },
	],
	reasoning: [ { name: 'qwq-plus', value: 'qwq-plus' } ],
	reasoningFreeTrial: [
		{ name: 'qvq-max', value: 'qvq-max' }, { name: 'qvq-max-latest', value: 'qvq-max-latest' },
		{ name: 'qvq-max-2025-03-25', value: 'qvq-max-2025-03-25' },
	],
	embeddings: [ { name: 'text-embedding-v3', value: 'text-embedding-v3' } ],
	visual: [
		{ name: 'qwen-vl-max', value: 'qwen-vl-max' }, { name: 'qwen-vl-plus', value: 'qwen-vl-plus' },
		{ name: 'qwen2.5-vl-72b-instruct', value: 'qwen2.5-vl-72b-instruct' },
	],
	visualFreeTrial: [
		{ name: 'qwen2.5-vl-32b-instruct', value: 'qwen2.5-vl-32b-instruct' }, { name: 'qwen2.5-vl-7b-instruct', value: 'qwen2.5-vl-7b-instruct' },
		{ name: 'qwen2.5-vl-3b-instruct', value: 'qwen2.5-vl-3b-instruct' },
	],
};

// Define type alias outside the class
type ModelCategory = keyof typeof modelOptionsDataDefinition;

// --- Node Class Definition ---

export class QwenModel implements INodeType {

	// --- Class Properties ---

	// Use static readonly for data accessed during description initialization
	private static readonly modelOptionsData = modelOptionsDataDefinition;

	// Node description - Initialize directly as a class field
	description: INodeTypeDescription = {
		displayName: 'Qwen Model',
		name: 'qwenModel',
		icon: 'file:qwen.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Qwen Chat models from Alibaba Cloud',
		defaults: { name: 'Qwen Model', color: '#1A82E2' },
		inputs: [{ displayName: 'Input', required: true, type: 'main' }],
		outputs: [{ displayName: 'Output', type: 'main' }],
		credentials: [{ name: 'alibabaCloudApi', required: true }],
		properties: [
			{
				displayName: 'Model Category',
				name: 'modelCategory',
				type: 'options',
				options: [
					{ name: 'Paid Models', value: 'paid' }, { name: 'Free Trial Models', value: 'freeTrial' },
					{ name: 'Reasoning Models', value: 'reasoning' }, { name: 'Reasoning Free Trial Models', value: 'reasoningFreeTrial' },
					{ name: 'Embeddings Models', value: 'embeddings' }, { name: 'Visual Models', value: 'visual' },
					{ name: 'Visual Free Trial Models', value: 'visualFreeTrial' },
				],
				default: 'paid',
				description: 'Select the category of the Qwen model',
				// 'loadOptionsMethod' is not a valid property for INodeProperties, remove it
			},
			{
				displayName: 'Model Name',
				name: 'modelName',
				type: 'options',
				displayOptions: {
					show: { modelCategory: Object.keys(QwenModel.modelOptionsData) },
				},
				default: '',
				required: true,
				description: 'Select the Qwen model (options depend on category)',
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'json',
				default: '[]',
				required: true,
				description: 'Chat history messages in JSON format (e.g., [{"role": "user", "content": "Hello"}])',
				placeholder: '[{"role": "user", "content": "Your message here"}]',
				hint: 'Input should be a valid JSON array of message objects, each with "role" and "content".',
			},
			{
				displayName: 'Additional Parameters',
				name: 'additionalParameters',
				type: 'collection',
				placeholder: 'Add Parameter',
				default: {},
				options: [
					{
						displayName: 'Temperature', name: 'temperature', type: 'number', default: 0.7,
						description: 'Controls randomness (0.0-2.0)', typeOptions: { minValue: 0, maxValue: 2.0 },
					},
					{
						displayName: 'Top P', name: 'top_p', type: 'number', default: 0.9,
						description: 'Nucleus sampling (0.0-1.0)', typeOptions: { minValue: 0, maxValue: 1.0 },
					},
					{
						displayName: 'Max Tokens', name: 'max_tokens', type: 'number', default: 2048,
						description: 'Max tokens to generate', typeOptions: { minValue: 1 },
					},
				],
			},
		],
	};

	// --- Class Methods ---

	async loadModelNameOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
		const category = this.getNodeParameter('modelCategory', 0) as ModelCategory;
			const options = QwenModel.modelOptionsData[category];
			return options ?? [];
		} catch (error) {
			return [];
		}
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		const clientIdentifier = 'n8n-node-alibaba-qwen/1.0.7';

		for (let i = 0; i < items.length; i++) {
			let itemJson: { success: boolean; response?: IQwenResponse; output?: string; usage?: IQwenResponse['usage']; requestId?: string; error?: { message: string; details: unknown } };

			try {
				const credentials = await this.getCredentials('alibabaCloudApi');
				if (!credentials?.apiKey) {
					throw new NodeOperationError(this.getNode(), 'Alibaba Cloud API credentials (API Key) missing/invalid.');
				}
				const apiKey = credentials.apiKey as string;

				const modelCategory = this.getNodeParameter('modelCategory', i, 'paid') as ModelCategory;
				const modelName = this.getNodeParameter('modelName', i) as string;
				const messagesJson = this.getNodeParameter('messages', i, '[]') as string;
				const additionalParameters = this.getNodeParameter('additionalParameters', i, {}) as INodeParameters;
		let messages: IQwenRequestBody['input']['messages'];
				try {
					messages = JSON.parse(messagesJson);
					if (!Array.isArray(messages)) {
						throw new Error('Messages input must be a valid JSON array.');
					}
					if (messages.some(msg => typeof msg !== 'object' || !msg.role || !msg.content)) {
						throw new Error('Each message must be an object with "role" and "content".');
					}
				} catch (e) {
					throw new NodeOperationError(this.getNode(), `Invalid JSON for Messages: ${(e as Error).message}`, { itemIndex: i });
				}

				const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

				const parameters: IQwenRequestBody['parameters'] = {};
				if (additionalParameters.temperature !== undefined) parameters.temperature = additionalParameters.temperature as number;
				if (additionalParameters.top_p !== undefined) parameters.top_p = additionalParameters.top_p as number;
				if (additionalParameters.max_tokens !== undefined) parameters.max_tokens = additionalParameters.max_tokens as number;

				const requestBody: IQwenRequestBody = {
					model: modelName,
					input: { messages: messages },
				};
				if (Object.keys(parameters).length > 0) {
					requestBody.parameters = parameters;
				}

				const response = await axios.post<IQwenResponse>(
					url,
					requestBody,
					{
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${apiKey}`,
							'X-DashScope-Client': clientIdentifier,
						},
						timeout: 60000,
					}
				);

				const outputText = response.data.output?.text ?? response.data.output?.choices?.[0]?.message?.content ?? '';

				itemJson = {
					success: true,
					response: response.data,
					output: outputText,
					usage: response.data.usage,
					requestId: response.data.request_id,
				};

			} catch (error) {
				let errMsg = 'Unknown error during Qwen API call';
				let errDetails: unknown = {};

				if (axios.isAxiosError(error)) {
					errMsg = `Qwen API Error: ${error.code || `Status ${error.response?.status}` || 'Unknown Code'} - ${error.message}`;
					errDetails = {
						status: error.response?.status, statusText: error.response?.statusText,
						data: error.response?.data, requestUrl: error.config?.url, requestMethod: error.config?.method,
					};
				} else if (error instanceof NodeOperationError) {
					errMsg = error.message;
				} else if (error instanceof Error) {
					errMsg = error.message;
					errDetails = { name: error.name, stack: error.stack };
				}

				itemJson = {
					success: false,
					error: { message: errMsg, details: errDetails },
				};
			}

			returnItems.push({ json: itemJson, pairedItem: { item: i } });
		}

		return [this.helpers.returnJsonArray(returnItems)];
	}
}
