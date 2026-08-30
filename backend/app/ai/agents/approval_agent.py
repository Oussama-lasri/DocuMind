from pprint import pprint

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command

load_dotenv(override=True)

model = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0)


@tool
def book_meeting(person: str, day: str) -> str:
    """Book a meeting with a person on a given day."""
    return f"Meeting booked with {person} on {day}."


approval_agent = create_agent(
    model=model,
    tools=[book_meeting],
    system_prompt="You are a scheduling assistant. Use the book_meeting tool.",
    # Interrupts allow you to pause graph execution at specific points and wait for external input before continuing.
    # This enables human-in-the-loop patterns where you need external input to proceed.
    # When an interrupt is triggered, LangGraph saves the graph state using its persistence layer and waits indefinitely until you resume execution.
    middleware=[HumanInTheLoopMiddleware(interrupt_on={"book_meeting": True})],
    checkpointer=InMemorySaver(),
)

config = {"configurable": {"thread_id": "approval-demo"}}
config2 = {"configurable": {"thread_id": "ts-demo"}}
# asynchronously invoke the agent with a user message

result = approval_agent.invoke(
    {"messages": [{"role": "user", "content": "Book a meeting with Sam on Friday."}]},
    config,
)
pprint(result)
interrupt = result["__interrupt__"][0]
print("The agent paused and is asking for approval:")
print(interrupt.value["action_requests"][0]["description"])


# resumed =  approval_agent.invoke(Command(resume={"decisions": [{"type": "approve"}]}), config)
# print(resumed["messages"][-1].content)

print("\nHuman approval required:")


answer = input("Approve? (yes/no): ").strip().lower()

if answer == "yes":
    decision = {"type": "approve"}
else:
    decision = {"type": "reject"}

try:
    resumed = approval_agent.invoke(Command(resume={"decisions": [decision]}), config)
except Exception as e:
    print("Error during resuming the agent:", str(e))
else:
    print("The agent resumed and produced the following output:")
    print(resumed["messages"][-1].content)
