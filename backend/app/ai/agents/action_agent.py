from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.ai.state.state import GraphState
from app.ai.tools.report_tool import generate_report
from pprint import pprint

ACTION_PROMPT = (
    "You are an action agent. Use the generate_report tool when the user "
    "wants their answer exported, saved, or turned into a report. "
    "Otherwise just confirm what action was requested."
)

llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)
llm_with_tools = llm.bind_tools([generate_report])


def action_agent_node(state: GraphState) -> dict:
    response = llm_with_tools.invoke(
        [SystemMessage(content=ACTION_PROMPT)] + state["generation"]
    )
    return {"messages": [response]}


print("Action agent is ready to handle requests.")
result = action_agent_node(
    {"messages": [{"role": "user", "content": "Please generate a report based on the research findings."}]}
)
print("Action agent output:")
print(result)
print(result["messages"][-1].content)