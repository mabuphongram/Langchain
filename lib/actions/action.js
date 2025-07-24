import {GoogleGenerativeAI} from '@google/generative-ai'
import {ConversationChain} from 'langchain/chains'
import {BufferMemory} from 'langchain/memory'

const memory = new BufferMemory()

  const model = new GoogleGenerativeAI(
    process.env.GOOGLE_GENAI_API_KEY);

    const chain = new ConversationChain({
        llm: model,
        memory: memory
    })

export async function askGenAI(formData) {
    const response = await chain.call({
        input: formData.input
    })
    return response
}
