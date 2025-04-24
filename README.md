# Qwen Model Node for n8n

## Description
This node allows you to interact with Qwen models from Alibaba Cloud in n8n. It supports various Qwen model categories including paid models, free trial models, reasoning models, and visual models.

## Installation

### Using npm

1. Install the node via npm:
   ```bash
   npm install n8n-node-alibaba-qwen
   ```

## Configuration

1. Open your n8n instance
2. Go to Settings > Community Nodes
3. Click on "Install"
4. Enter `n8n-node-alibaba-qwen` in the "Enter npm package name" field
5. Click on "Install"

### Credentials

To use this node, you need to set up Alibaba Cloud API credentials:

1. Go to your n8n Credentials section
2. Click on "Create New Credentials"
3. Search for "Alibaba Cloud API"
4. Enter your Access Key ID and Access Key Secret
5. Save the credentials

## Usage

The node supports different model categories:

- Paid Models (e.g., qwen-max, qwen-plus)
- Free Trial Models (e.g., qwen2.5-14b-instruct)
- Reasoning Models
- Visual Models
- Embeddings Models

### Basic Example

1. Add the Qwen Model node to your workflow
2. Select your Alibaba Cloud API credentials
3. Choose the Model Category
4. Select a specific Model Name
5. Enter your prompt
6. Connect the node to your workflow

### Available Model Categories

- **Paid Models**: Production-ready models like qwen-max, qwen-plus
- **Free Trial Models**: Trial versions like qwen2.5-14b-instruct
- **Reasoning Models**: Specialized for reasoning tasks
- **Visual Models**: Support for vision-language tasks
- **Embeddings Models**: Text embedding capabilities

## Support

If you encounter any issues or have questions:
- Create an issue in our [GitHub repository](https://github.com/salomaopublicidade/n8n-node-alibaba-qwen)
- Contact us through our support channels

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.