# Creating and Managing AI Toolkit Services

pgEdge Cloud databases can be deployed with an installed and configured MCP server, ready for connections; after deployment, you can use the `Services` page to open the `Add MCP Server` popup to add AI functionality to an existing cluster or to manage the defined functionality.

![The Services page](../cloud/images/services.png)

Select the Add MCP Server button to access the Add MCP Server popup and define an MCP server, and optionally enable an associated LLM.

![Adding an MCP Server](../cloud/images/add_mcp_server.png)

Use fields on the `Add MCP Server` popup to describe the server and optionally, the LLM:

* Click the `Select Host` field to select the node that the MCP server will be provisioned on; you can deploy the MCP server on each node of your cluster, but each MCP server deployment must be individually defined.

* Use the API Token field to provide the API token used to authenticate with your MCP server.  This is available from your MCP provider.

* Slide the `LLM Enabled?` toggle switch to enable the LLM detail fields.

* Use the LLM Provider drop-down to select your AI provider; currently, Cloud supports the following AI providers:

    * Anthropic AI (Claude)
    * OpenAI (ChatGPT)
    * Ollama

* Enter the model name of the LLM provider; this field is not validated, but must match the name of an available model.  For example, the following models are supported:

    * claude-sonnet-4-6
    * gpt-4o
    * llama3.1