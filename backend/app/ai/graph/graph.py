from dotenv import load_dotenv

from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.graph import StateGraph, END, START

from app.ai.state.state import GraphState
from app.ai.agents import (
    action_agent,
    research_agent,
    summarizer_agent,
    router_agent,
)
from app.ai.tools import report_tool, ocr_tool, retriever_tool


load_dotenv()

ROUTER = "router"
RESEARCH = "research"
SUMMARIZER = "summarizer"
ACTION = "action"

RESEARCH_TOOLS = "research_tools"
ACTION_TOOLS = "action_tools"


# -------------------------
# Tool nodes
# -------------------------

research_tool_node = ToolNode([
    retriever_tool.search_documents
])

action_tool_node = ToolNode([
    report_tool.generate_report
])


# -------------------------
# Graph
# -------------------------

workflow = StateGraph(GraphState)


# Agents
workflow.add_node(ROUTER, router_agent.router_agent_node)
workflow.add_node(RESEARCH, research_agent.research_agent_node)
workflow.add_node(SUMMARIZER, summarizer_agent.summarizer_agent_node)
workflow.add_node(ACTION, action_agent.action_agent_node)


# Tool nodes
workflow.add_node(RESEARCH_TOOLS, research_tool_node)
workflow.add_node(ACTION_TOOLS, action_tool_node)


# -------------------------
# START
# -------------------------

workflow.add_edge(START, ROUTER)


# -------------------------
# Router
# -------------------------

workflow.add_conditional_edges(
    ROUTER,
    lambda state: state["next_agent"],
    {
        "research": RESEARCH,
        "summarizer": SUMMARIZER,
        "action": ACTION,
    }
)


# -------------------------
# Research agent → tools
# -------------------------
# create a loop between your Research Agent and its tools.
workflow.add_conditional_edges(
    RESEARCH,
    tools_condition,
    {
        "tools": RESEARCH_TOOLS,
        END: END,
    }
)


# Tool → Research agent
# sends the result back to the agent
workflow.add_edge(
    RESEARCH_TOOLS,
    RESEARCH
)


# -------------------------
# Action agent → tools
# -------------------------

workflow.add_conditional_edges(
    ACTION,
    tools_condition,
    {
        "tools": ACTION_TOOLS,
        END: END,
    }
)


# Tool → Action agent
workflow.add_edge(
    ACTION_TOOLS,
    ACTION
)


# -------------------------
# Compile
# -------------------------

app = workflow.compile()

app.get_graph().draw_mermaid_png(
    output_file_path="graph.png"
)
if __name__ == "__main__":

    # result = app.invoke({
    #     "messages": [
    #         {
    #             "role": "user",
    #             "content": "Search my documents for information about LangGraph"
    #         }
    #     ]
    # })
    
    result = app.invoke({
        "messages": [
            {
                "role": "user",
                "content": (
                    "Generate a report with blank content. "
                    "The report should summarize the main information "
                    "and highlight the most important points."
                )
            }
        ]
    })

    for message in result["messages"]:
        print("\n--- MESSAGE ---")
        print(message)