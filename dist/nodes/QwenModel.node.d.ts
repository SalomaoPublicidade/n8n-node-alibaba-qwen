import { type INodeType, type INodeTypeDescription, type INodeExecutionData, type IExecuteFunctions, type INodePropertyOptions, type ILoadOptionsFunctions } from 'n8n-workflow';
export declare class QwenModel implements INodeType {
    private static readonly modelOptionsData;
    description: INodeTypeDescription;
    loadModelNameOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
