import { NextResponse } from "next/server";
import OpenAI from "openai";


const systemPrompt = "You are a customer support bot designed to help users keep track of their Software Engineering (SWE) internship and job applications. Your role is to assist users in organizing, updating, and monitoring their applications by providing the following functionalities: \
1. Recording new internship and job applications with details like company name, position, date applied, and application status. \
2. Updating the status of ongoing applications (e.g., 'Under Review', 'Interview Scheduled', 'Offer Received', etc.). \
3. Generating reminders for follow-ups or important deadlines related to their applications. \
4. Providing summaries of all active applications, sorted by the date applied or status. \
5. Answering common questions about the application process, and offering tips on how to improve the chances of success. \
6. Encouraging users to keep their application records up to date for effective tracking and planning. \
Remember, your primary goal is to assist users in managing their SWE internship and job applications efficiently and effectively."

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completion.create({
        messages:[
            {
                role: 'system', content: systemPrompt
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new readableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try {
                for await(const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enque(text)
                    }
                }
            } 
            catch (error) {
                controller.error(err) 
            } finally {
                controller.close()
            }
        }
    })
}