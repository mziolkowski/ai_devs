import axios from 'axios';
import dotenv from 'dotenv'

export var token = "";
dotenv.config({ path: './.env' })

async function authenticate(taskName: string): Promise<string> {
    try {
        console.log("Fetching token...")
        const apiKey = process.env.AI_DEVS_API_KEY;
        const response = await axios.post(`${process.env.AI_DEVS_API_URL}/token/${taskName}`, {
            "apikey": apiKey
        }, {
            headers: {
                'Accept-Encoding': 'gzip'
            }
        });
        console.log("Successfully fetched token.")
        token = await response.data.token;
        return response.data.token;
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
}


export async function getTask(taskName: string): Promise<any> {
    await authenticate(taskName)
    try {
        console.log("Fetching task...")
        const response = await axios.get(`${process.env.AI_DEVS_API_URL}/task/${token}`,
            {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });
        console.log("Fetching task returned following data:");
        console.log(response.data);

        return response.data;
    } catch (error) {
        // @ts-ignore
        console.error('Error fetching data:', error.data);
        throw error;
    }
}

export async function answer(answer: any): Promise<any> {
    try {
        console.log("Sending an answer...")
        const response = await axios.post(`${process.env.AI_DEVS_API_URL}/answer/${token}`,
            { "answer":  answer }, {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            });
        console.log("Sending an answer returned following data:")
        console.log(response.data)
        return await response.data;
    } catch (error) {
        // @ts-ignore
        console.error('Error calling external API:', error.response.data);
        throw error;
    }
}