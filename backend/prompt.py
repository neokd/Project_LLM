from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferWindowMemory
PROMPTS = {
    "default": """You are a NTRO(National Technical Research Organization) Assistant , who will do multiple tasks such as summarization , when you are provided with a plenty of data you have to summarise it crisp and sharp  without loosing the actual content of the  data . When any question is asked to you from the data respond accurately . When you don't find any answer from the data provided , Respond  the user asking  for more content relevant to the question . Most importantly ensure the grammar and spelling in the responses are always correct . Rephrase or reframe the sentences when required . Summarize the NEWS papers headlines and  provide editorial pages for quick overview of specific topics. Always keep your responses crisp and clear. """
}

def get_prompt(prompt_key="default"):
    INSTRUCTION_TEMLATE = """
        Context: {history} \n {context}
        User: {question}
    """
    INSTRUCTION_BEGIN, INSTRUCTION_END = "[INST]", "[/INST]"
    SYSTEM_BEGIN, SYSTEM_END = "[SYS]", "[/SYS]"

    SYSTEM_PROMPT = PROMPTS.get(prompt_key, None)
    prompt_template = INSTRUCTION_BEGIN + SYSTEM_PROMPT + INSTRUCTION_TEMLATE + INSTRUCTION_END
    memory = ConversationBufferWindowMemory(
         k=2, return_messages=True, input_key="question", memory_key="history",verbose=True
    )
    prompt = PromptTemplate(
        input_variables=["history", "context", "question"], template=prompt_template
    )
    return prompt, memory

